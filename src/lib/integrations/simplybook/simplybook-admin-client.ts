import {
    ExternalSystem,
    IntegrationConnectionStatus,
} from "../../../../generated/prisma/enums";

import { prisma } from "@/lib/prisma";

import {
    decryptIntegrationSecret,
} from "@/lib/security/integration-crypto";

import {
    refreshPersistedSimplyBookToken,
} from "./simplybook-connection.service";

import {
    SimplyBookApiError,
    simplyBookRequest,
} from "./simplybook-http";

type SimplyBookAdminRequestInput = {
    tenantId: string;
    path: string;

    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

    body?: unknown;
};

export async function simplyBookAdminRequest<T>(
    input: SimplyBookAdminRequestInput
): Promise<T> {
    const connection =
        await prisma.integrationConnection.findUnique({
            where: {
                tenantId_system: {
                    tenantId: input.tenantId,
                    system: ExternalSystem.SIMPLYBOOK,
                },
            },
        });

    if (!connection) {
        throw new Error(
            "SimplyBook n'est pas configuré pour ce tenant."
        );
    }

    if (
        connection.status !==
        IntegrationConnectionStatus.CONNECTED
    ) {
        throw new Error(
            "La connexion SimplyBook n'est pas active."
        );
    }

    if (
        !connection.apiBaseUrl ||
        !connection.companyLogin ||
        !connection.accessTokenEncrypted
    ) {
        throw new Error(
            "La connexion SimplyBook est incomplète."
        );
    }

    let accessToken =
        decryptIntegrationSecret(
            connection.accessTokenEncrypted
        );

    try {
        return await executeRequest<T>({
            baseUrl: connection.apiBaseUrl,
            companyLogin: connection.companyLogin,
            accessToken,
            path: input.path,
            method: input.method,
            body: input.body,
        });
    } catch (error) {

        const isExpiredToken =
            isSimplyBookTokenExpired(error);

        if (!isExpiredToken) {
            throw error;
        }

        console.log(
            "[SimplyBook Refresh]",
            "Token expirado detectado. Intentando refresh..."
        );
    }

    try {
        accessToken =
            await refreshPersistedSimplyBookToken(
                input.tenantId
            );

    } catch (error) {
        console.error(
            "[SimplyBook Refresh Failed]",
            error
        );

        throw error;
    }

    return executeRequest<T>({
        baseUrl: connection.apiBaseUrl,
        companyLogin: connection.companyLogin,
        accessToken,
        path: input.path,
        method: input.method,
        body: input.body,
    });
}

async function executeRequest<T>(input: {
    baseUrl: string;

    companyLogin: string;
    accessToken: string;

    path: string;

    method?:
    | "GET"
    | "POST"
    | "PUT"
    | "PATCH"
    | "DELETE";

    body?: unknown;
}): Promise<T> {

    // console.log("[SimplyBook Admin Request]", {
    //     baseUrl: input.baseUrl,
    //     path: input.path,
    //     companyLogin: input.companyLogin,
    //     tokenLength: input.accessToken.length,
    //     tokenPrefix: input.accessToken.slice(0, 6),
    // });

    return simplyBookRequest<T>(
        input.baseUrl,
        input.path,
        {
            method: input.method ?? "GET",

            headers: {
                "X-Company-Login":
                    input.companyLogin,

                "X-Token":
                    input.accessToken,
            },

            body: input.body,
        }
    );
}


function isSimplyBookTokenExpired(
    error: unknown
): boolean {
    if (
        !(error instanceof SimplyBookApiError)
    ) {
        return false;
    }

    // Caso clásico documentado
    if (error.status === 419) {
        return true;
    }

    // SimplyBook V2 puede devolver HTTP 401
    // pero con "Token Expired" en el body/message.
    if (
        error.status === 401 &&
        error.message
            .trim()
            .toLowerCase() ===
        "token expired"
    ) {
        return true;
    }

    const body = error.responseBody;

    if (
        typeof body === "object" &&
        body !== null
    ) {
        const record =
            body as Record<string, unknown>;

        const code =
            Number(record.code);

        const message =
            typeof record.message === "string"
                ? record.message
                    .trim()
                    .toLowerCase()
                : "";

        if (
            code === 419 ||
            message === "token expired"
        ) {
            return true;
        }
    }

    return false;
}