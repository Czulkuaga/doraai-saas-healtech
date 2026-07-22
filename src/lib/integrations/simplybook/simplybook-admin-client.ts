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

            companyLogin:
                connection.companyLogin,

            accessToken,

            path: input.path,
            method: input.method,
            body: input.body,
        });
    } catch (error) {
        const isExpiredToken =
            error instanceof SimplyBookApiError &&
            error.status === 419;

        if (!isExpiredToken) {
            throw error;
        }
    }

    /*
     * El token expiró.
     * Intentamos renovarlo UNA sola vez.
     */
    accessToken =
        await refreshPersistedSimplyBookToken(
            input.tenantId
        );

    return executeRequest<T>({
        baseUrl: connection.apiBaseUrl,

        companyLogin:
            connection.companyLogin,

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