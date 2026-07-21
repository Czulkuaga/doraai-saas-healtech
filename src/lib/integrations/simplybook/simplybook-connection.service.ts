import { randomUUID } from "node:crypto";

import {
    ExternalSystem,
    IntegrationAuthType,
    IntegrationConnectionStatus,
    IntegrationDirection,
    IntegrationOperation,
    IntegrationSyncStatus,
    Prisma
} from "../../../../generated/prisma/client";

import { prisma } from "@/lib/prisma";
import {
    decryptIntegrationSecret,
    encryptIntegrationSecret,
} from "@/lib/security/integration-crypto";

import {
    connectSimplyBookAdmin,
    logoutSimplyBookAdmin,
    refreshSimplyBookAdminToken,
    verifySimplyBookTwoFactor,
} from "./simplybook-auth.service";

import type {
    SimplyBookConnectInput,
    SimplyBookConnectionSummary,
    SimplyBookTokenEntity,
    SimplyBookVerifyTwoFactorInput,
} from "./simplybook.types";

function normalizeBaseUrl(value: string): string {
    const normalized = value.trim().replace(/\/$/, "");

    if (!normalized.startsWith("https://")) {
        throw new Error(
            "La URL de SimplyBook debe utilizar HTTPS."
        );
    }

    return normalized;
}

export async function getSimplyBookConnectionSummary(
    tenantId: string
): Promise<SimplyBookConnectionSummary> {
    const connection =
        await prisma.integrationConnection.findUnique({
            where: {
                tenantId_system: {
                    tenantId,
                    system: ExternalSystem.SIMPLYBOOK,
                },
            },
        });

    if (!connection) {
        return {
            configured: false,
            status: "NOT_CONFIGURED",

            authMethod: null,

            displayName: null,
            companyLogin: null,
            userLogin: null,
            apiBaseUrl: null,
            domain: null,

            hasApiUserKey: false,
            hasPassword: false,
            hasAccessToken: false,
            hasRefreshToken: false,

            require2fa: false,
            allowed2faProviders: [],

            connectedAt: null,
            lastValidatedAt: null,

            lastErrorCode: null,
            lastErrorMessage: null,
        };
    }

    const allowedProviders = Array.isArray(
        connection.allowed2faProviders
    )
        ? connection.allowed2faProviders.filter(
            (item): item is string =>
                typeof item === "string"
        )
        : [];

    return {
        configured: true,
        status: connection.status,

        authMethod:
            connection.authType === IntegrationAuthType.API_USER_KEY
                ? "API_USER_KEY"
                : connection.authType === IntegrationAuthType.USER_PASSWORD
                    ? "USER_PASSWORD"
                    : null,

        displayName: connection.displayName,
        companyLogin: connection.companyLogin,
        userLogin: connection.userLogin,
        apiBaseUrl: connection.apiBaseUrl,
        domain: connection.domain,

        hasApiUserKey: Boolean(
            connection.apiUserKeyEncrypted
        ),

        hasPassword: Boolean(
            connection.passwordEncrypted
        ),

        hasAccessToken: Boolean(
            connection.accessTokenEncrypted
        ),

        hasRefreshToken: Boolean(
            connection.refreshTokenEncrypted
        ),

        require2fa: connection.require2fa,
        allowed2faProviders: allowedProviders,

        connectedAt:
            connection.connectedAt?.toISOString() ?? null,

        lastValidatedAt:
            connection.lastValidatedAt?.toISOString() ??
            null,

        lastErrorCode: connection.lastErrorCode,
        lastErrorMessage: connection.lastErrorMessage,
    };
}

export async function connectAndPersistSimplyBook(
    tenantId: string,
    input: SimplyBookConnectInput
) {
    const startedAt = new Date();

    const baseUrl = normalizeBaseUrl(input.apiBaseUrl);
    const company = input.company.trim().toLowerCase();
    const login = input.login.trim();

    const authMethod = input.authMethod;

    const apiUserKey =
        input.apiUserKey?.trim() ?? "";

    /*
     * No hacemos trim porque una contraseña puede
     * contener espacios al inicio o al final.
     */
    const password =
        input.password ?? "";

    if (!company) {
        throw new Error(
            "Company login es obligatorio."
        );
    }

    if (!login) {
        throw new Error(
            "El usuario es obligatorio."
        );
    }

    if (
        authMethod !== "API_USER_KEY" &&
        authMethod !== "USER_PASSWORD"
    ) {
        throw new Error(
            "El método de autenticación no es válido."
        );
    }

    const existingConnection =
        await prisma.integrationConnection.findUnique({
            where: {
                tenantId_system: {
                    tenantId,
                    system: ExternalSystem.SIMPLYBOOK,
                },
            },
        });

    let authenticationSecret: string;

    if (authMethod === "API_USER_KEY") {
        if (apiUserKey) {
            authenticationSecret = apiUserKey;
        } else if (
            existingConnection?.authType ===
            IntegrationAuthType.API_USER_KEY &&
            existingConnection.apiUserKeyEncrypted
        ) {
            authenticationSecret =
                decryptIntegrationSecret(
                    existingConnection.apiUserKeyEncrypted
                );
        } else {
            throw new Error(
                "La API User Key es obligatoria."
            );
        }
    } else {
        if (password) {
            authenticationSecret = password;
        } else if (
            existingConnection?.authType ===
            IntegrationAuthType.USER_PASSWORD &&
            existingConnection.passwordEncrypted
        ) {
            authenticationSecret =
                decryptIntegrationSecret(
                    existingConnection.passwordEncrypted
                );
        } else {
            throw new Error(
                "La contraseña es obligatoria."
            );
        }
    }

    const prismaAuthType =
        authMethod === "API_USER_KEY"
            ? IntegrationAuthType.API_USER_KEY
            : IntegrationAuthType.USER_PASSWORD;

    const authResult = await connectSimplyBookAdmin(
        baseUrl,
        {
            company,
            login,
            password: authenticationSecret,
        }
    );

    if (authResult.status === "TWO_FACTOR_REQUIRED") {
        await prisma.$transaction([
            prisma.integrationConnection.upsert({
                where: {
                    tenantId_system: {
                        tenantId,
                        system:
                            ExternalSystem.SIMPLYBOOK,
                    },
                },
                create: {
                    tenantId,
                    system: ExternalSystem.SIMPLYBOOK,
                    authType: prismaAuthType,
                    status:
                        IntegrationConnectionStatus.TWO_FACTOR_REQUIRED,

                    displayName:
                        input.displayName?.trim() ||
                        "SimplyBook.me",

                    companyLogin: company,
                    userLogin: login,
                    apiBaseUrl: baseUrl,

                    apiUserKeyEncrypted:
                        authMethod === "API_USER_KEY"
                            ? encryptIntegrationSecret(
                                authenticationSecret
                            )
                            : null,
                    passwordEncrypted:
                        authMethod === "USER_PASSWORD"
                            ? encryptIntegrationSecret(
                                authenticationSecret
                            )
                            : null,

                    require2fa: true,
                    authSessionId:
                        authResult.authSessionId,
                    allowed2faProviders:
                        authResult.allowedProviders,

                    lastAuthAttemptAt: new Date(),
                },
                update: {
                    authType: prismaAuthType,
                    status:
                        IntegrationConnectionStatus.TWO_FACTOR_REQUIRED,

                    displayName:
                        input.displayName?.trim() ||
                        "SimplyBook.me",

                    companyLogin: company,
                    userLogin: login,
                    apiBaseUrl: baseUrl,

                    apiUserKeyEncrypted:
                        authMethod === "API_USER_KEY"
                            ? encryptIntegrationSecret(
                                authenticationSecret
                            )
                            : null,

                    passwordEncrypted:
                        authMethod === "USER_PASSWORD"
                            ? encryptIntegrationSecret(
                                authenticationSecret
                            )
                            : null,

                    require2fa: true,
                    authSessionId:
                        authResult.authSessionId,
                    allowed2faProviders:
                        authResult.allowedProviders,

                    accessTokenEncrypted: null,
                    refreshTokenEncrypted: null,

                    lastAuthAttemptAt: new Date(),
                    lastErrorAt: null,
                    lastErrorCode: null,
                    lastErrorMessage: null,
                },
            }),

            prisma.integrationSyncLog.create({
                data: {
                    tenantId,
                    system: ExternalSystem.SIMPLYBOOK,
                    direction:
                        IntegrationDirection.OUTBOUND,
                    operation:
                        IntegrationOperation.GET_TOKEN,
                    status:
                        IntegrationSyncStatus.PARTIAL,
                    message:
                        "SimplyBook requiere autenticación de segundo factor.",
                    requestPayload: {
                        company,
                        login,
                        apiBaseUrl: baseUrl,
                    },
                    responsePayload: {
                        require2fa: true,
                        allowedProviders:
                            authResult.allowedProviders,
                    },
                    startedAt,
                    finishedAt: new Date(),
                },
            }),
        ]);

        return {
            status: "TWO_FACTOR_REQUIRED" as const,
            allowedProviders:
                authResult.allowedProviders,
        };
    }

    await persistConnectedSimplyBook(
        tenantId,
        {
            displayName: input.displayName,
            apiBaseUrl: baseUrl,
            authMethod,

            apiUserKey:
                authMethod === "API_USER_KEY"
                    ? authenticationSecret
                    : undefined,

            password:
                authMethod === "USER_PASSWORD"
                    ? authenticationSecret
                    : undefined,
        },
        authResult.tokenEntity,
        existingConnection?.deviceTokenEncrypted ??
        null,
        startedAt
    );

    return {
        status: "CONNECTED" as const,
    };
}

async function persistConnectedSimplyBook(
    tenantId: string,
    input: {
        displayName?: string;
        apiBaseUrl: string;

        authMethod:
        | "API_USER_KEY"
        | "USER_PASSWORD";

        apiUserKey?: string;
        password?: string;
    },
    tokenEntity: SimplyBookTokenEntity,
    existingDeviceTokenEncrypted: string | null,
    startedAt: Date
) {
    const encryptedDeviceToken =
        existingDeviceTokenEncrypted ??
        encryptIntegrationSecret(randomUUID());

    const prismaAuthType =
        input.authMethod === "API_USER_KEY"
            ? IntegrationAuthType.API_USER_KEY
            : IntegrationAuthType.USER_PASSWORD;

    await prisma.$transaction([
        prisma.integrationConnection.upsert({
            where: {
                tenantId_system: {
                    tenantId,
                    system: ExternalSystem.SIMPLYBOOK,
                },
            },
            create: {
                tenantId,
                system: ExternalSystem.SIMPLYBOOK,
                authType: prismaAuthType,
                status:
                    IntegrationConnectionStatus.CONNECTED,

                displayName:
                    input.displayName?.trim() ||
                    "SimplyBook.me",

                companyLogin: tokenEntity.company,
                userLogin: tokenEntity.login,
                apiBaseUrl: input.apiBaseUrl,
                domain: tokenEntity.domain,

                apiUserKeyEncrypted:
                    input.authMethod === "API_USER_KEY" &&
                        input.apiUserKey
                        ? encryptIntegrationSecret(
                            input.apiUserKey
                        )
                        : null,

                passwordEncrypted:
                    input.authMethod === "USER_PASSWORD" &&
                        input.password
                        ? encryptIntegrationSecret(
                            input.password
                        )
                        : null,

                accessTokenEncrypted:
                    encryptIntegrationSecret(
                        tokenEntity.token
                    ),

                refreshTokenEncrypted:
                    encryptIntegrationSecret(
                        tokenEntity.refresh_token
                    ),

                deviceTokenEncrypted:
                    encryptedDeviceToken,

                require2fa: false,
                authSessionId: null,
                allowed2faProviders:
                    Prisma.JsonNull,

                connectedAt: new Date(),
                lastValidatedAt: new Date(),
                lastAuthAttemptAt: new Date(),
            },
            update: {
                status:
                    IntegrationConnectionStatus.CONNECTED,
                authType: prismaAuthType,
                displayName:
                    input.displayName?.trim() ||
                    "SimplyBook.me",

                companyLogin: tokenEntity.company,
                userLogin: tokenEntity.login,
                apiBaseUrl: input.apiBaseUrl,
                domain: tokenEntity.domain,

                apiUserKeyEncrypted:
                    input.authMethod === "API_USER_KEY" &&
                        input.apiUserKey
                        ? encryptIntegrationSecret(
                            input.apiUserKey
                        )
                        : null,

                passwordEncrypted:
                    input.authMethod === "USER_PASSWORD" &&
                        input.password
                        ? encryptIntegrationSecret(
                            input.password
                        )
                        : null,

                accessTokenEncrypted:
                    encryptIntegrationSecret(
                        tokenEntity.token
                    ),

                refreshTokenEncrypted:
                    encryptIntegrationSecret(
                        tokenEntity.refresh_token
                    ),

                deviceTokenEncrypted:
                    encryptedDeviceToken,

                require2fa: false,
                authSessionId: null,
                allowed2faProviders:
                    Prisma.JsonNull,

                connectedAt: new Date(),
                lastValidatedAt: new Date(),
                lastAuthAttemptAt: new Date(),
                lastRefreshAt: null,

                lastErrorAt: null,
                lastErrorCode: null,
                lastErrorMessage: null,
            },
        }),

        prisma.integrationSyncLog.create({
            data: {
                tenantId,
                system: ExternalSystem.SIMPLYBOOK,
                direction:
                    IntegrationDirection.OUTBOUND,
                operation:
                    IntegrationOperation.GET_TOKEN,
                status:
                    IntegrationSyncStatus.SUCCESS,
                message:
                    "Conexión con SimplyBook establecida correctamente.",
                requestPayload: {
                    company: tokenEntity.company,
                    login: tokenEntity.login,
                    apiBaseUrl: input.apiBaseUrl,
                },
                responsePayload: {
                    authenticated: true,
                    hasRefreshToken: Boolean(
                        tokenEntity.refresh_token
                    ),
                    domain: tokenEntity.domain,
                },
                startedAt,
                finishedAt: new Date(),
            },
        }),
    ]);
}

export async function verifyAndPersistSimplyBookTwoFactor(
    tenantId: string,
    input: SimplyBookVerifyTwoFactorInput
) {
    const startedAt = new Date();

    const connection =
        await prisma.integrationConnection.findUnique({
            where: {
                tenantId_system: {
                    tenantId,
                    system: ExternalSystem.SIMPLYBOOK,
                },
            },
        });

    if (!connection) {
        throw new Error(
            "No existe una conexión pendiente de SimplyBook."
        );
    }

    if (
        connection.status !==
        IntegrationConnectionStatus.TWO_FACTOR_REQUIRED
    ) {
        throw new Error(
            "La conexión no está esperando un segundo factor."
        );
    }

    if (
        !connection.apiBaseUrl ||
        !connection.companyLogin ||
        !connection.authSessionId
    ) {
        throw new Error(
            "La conexión pendiente está incompleta."
        );
    }

    const tokenEntity =
        await verifySimplyBookTwoFactor(
            connection.apiBaseUrl,
            {
                company: connection.companyLogin,
                session_id: connection.authSessionId,
                type: input.type,
                code: input.code,
            }
        );

    const authMethod =
        connection.authType ===
            IntegrationAuthType.API_USER_KEY
            ? "API_USER_KEY"
            : connection.authType ===
                IntegrationAuthType.USER_PASSWORD
                ? "USER_PASSWORD"
                : null;

    if (!authMethod) {
        throw new Error(
            "El método de autenticación almacenado no es compatible."
        );
    }

    await persistConnectedSimplyBook(
        tenantId,
        {
            displayName:
                connection.displayName ?? undefined,

            apiBaseUrl: connection.apiBaseUrl,

            authMethod,

            apiUserKey:
                authMethod === "API_USER_KEY" &&
                    connection.apiUserKeyEncrypted
                    ? decryptIntegrationSecret(
                        connection.apiUserKeyEncrypted
                    )
                    : undefined,

            password:
                authMethod === "USER_PASSWORD" &&
                    connection.passwordEncrypted
                    ? decryptIntegrationSecret(
                        connection.passwordEncrypted
                    )
                    : undefined,
        },
        tokenEntity,
        connection.deviceTokenEncrypted,
        startedAt
    );

    return {
        status: "CONNECTED" as const,
    };
}

export async function refreshPersistedSimplyBookToken(
    tenantId: string
): Promise<string> {
    const connection =
        await prisma.integrationConnection.findUnique({
            where: {
                tenantId_system: {
                    tenantId,
                    system: ExternalSystem.SIMPLYBOOK,
                },
            },
        });

    if (
        !connection ||
        !connection.apiBaseUrl ||
        !connection.companyLogin ||
        !connection.refreshTokenEncrypted ||
        !connection.deviceTokenEncrypted
    ) {
        throw new Error(
            "La conexión no tiene datos suficientes para renovar el token."
        );
    }

    const refreshed =
        await refreshSimplyBookAdminToken(
            connection.apiBaseUrl,
            {
                company: connection.companyLogin,
                refresh_token:
                    decryptIntegrationSecret(
                        connection.refreshTokenEncrypted
                    ),
                device_token:
                    decryptIntegrationSecret(
                        connection.deviceTokenEncrypted
                    ),
            }
        );

    await prisma.integrationConnection.update({
        where: {
            id: connection.id,
        },
        data: {
            status:
                IntegrationConnectionStatus.CONNECTED,
            accessTokenEncrypted:
                encryptIntegrationSecret(
                    refreshed.token
                ),
            refreshTokenEncrypted:
                encryptIntegrationSecret(
                    refreshed.refresh_token
                ),
            domain: refreshed.domain,
            lastRefreshAt: new Date(),
            lastValidatedAt: new Date(),
            lastErrorAt: null,
            lastErrorCode: null,
            lastErrorMessage: null,
        },
    });

    return refreshed.token;
}

export async function disconnectSimplyBook(
    tenantId: string
): Promise<void> {
    const startedAt = new Date();

    const connection =
        await prisma.integrationConnection.findUnique({
            where: {
                tenantId_system: {
                    tenantId,
                    system: ExternalSystem.SIMPLYBOOK,
                },
            },
        });

    if (!connection) {
        await prisma.integrationSyncLog.create({
            data: {
                tenantId,
                system: ExternalSystem.SIMPLYBOOK,
                direction: IntegrationDirection.OUTBOUND,
                operation: IntegrationOperation.DISCONNECT,
                status: IntegrationSyncStatus.SKIPPED,
                message:
                    "No existe una conexión SimplyBook configurada para desconectar.",
                startedAt,
                finishedAt: new Date(),
            },
        });

        return;
    }

    let remoteLogoutSucceeded = false;

    try {
        if (
            connection.apiBaseUrl &&
            connection.accessTokenEncrypted
        ) {
            await logoutSimplyBookAdmin(
                connection.apiBaseUrl,
                {
                    auth_token:
                        decryptIntegrationSecret(
                            connection.accessTokenEncrypted
                        ),
                }
            );

            remoteLogoutSucceeded = true;
        }

        await prisma.$transaction([
            prisma.integrationConnection.update({
                where: {
                    id: connection.id,
                },
                data: {
                    status:
                        IntegrationConnectionStatus.DISABLED,

                    accessTokenEncrypted: null,
                    refreshTokenEncrypted: null,

                    authSessionId: null,
                    require2fa: false,
                    allowed2faProviders:
                        Prisma.JsonNull,

                    lastValidatedAt: null,
                },
            }),

            prisma.integrationSyncLog.create({
                data: {
                    tenantId,
                    system: ExternalSystem.SIMPLYBOOK,
                    direction:
                        IntegrationDirection.OUTBOUND,
                    operation:
                        IntegrationOperation.DISCONNECT,
                    status:
                        IntegrationSyncStatus.SUCCESS,
                    message:
                        "Connexion SimplyBook déconnectée correctement.",

                    requestPayload: {
                        companyLogin:
                            connection.companyLogin,
                        userLogin:
                            connection.userLogin,
                    },

                    responsePayload: {
                        remoteLogoutSucceeded,
                        localConnectionDisabled: true,
                    },

                    startedAt,
                    finishedAt: new Date(),
                },
            }),
        ]);
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Erreur inconnue lors de la déconnexion SimplyBook.";

        await prisma.integrationSyncLog
            .create({
                data: {
                    tenantId,
                    system:
                        ExternalSystem.SIMPLYBOOK,
                    direction:
                        IntegrationDirection.OUTBOUND,
                    operation:
                        IntegrationOperation.DISCONNECT,
                    status:
                        IntegrationSyncStatus.FAILED,
                    message,

                    requestPayload: {
                        companyLogin:
                            connection.companyLogin,
                        userLogin:
                            connection.userLogin,
                    },

                    startedAt,
                    finishedAt: new Date(),
                },
            })
            .catch((logError) => {
                console.error(
                    "[disconnectSimplyBook][log]",
                    logError
                );
            });

        throw error;
    }
}