import { simplyBookRequest } from "./simplybook-http";

import type {
    SimplyBookAdminAuthInput,
    SimplyBookConnectResult,
    SimplyBookLogoutInput,
    SimplyBookRefreshTokenInput,
    SimplyBookTokenEntity,
    SimplyBookTwoFactorInput,
} from "./simplybook.types";

export async function authenticateSimplyBookAdmin(
    baseUrl: string,
    input: SimplyBookAdminAuthInput
): Promise<SimplyBookTokenEntity> {
    const result =
        await simplyBookRequest<SimplyBookTokenEntity>(
            baseUrl,
            "/admin/auth",
            {
                method: "POST",
                body: input,
            }
        );

    if (!result.company) {
        throw new Error(
            "SimplyBook no devolvió el identificador de compañía."
        );
    }

    if (!result.login) {
        throw new Error(
            "SimplyBook no devolvió el usuario autenticado."
        );
    }

    return result;
}

export async function connectSimplyBookAdmin(
    baseUrl: string,
    input: SimplyBookAdminAuthInput
): Promise<SimplyBookConnectResult> {
    const tokenEntity = await authenticateSimplyBookAdmin(
        baseUrl,
        input
    );

    if (tokenEntity.require2fa) {
        if (!tokenEntity.auth_session_id) {
            throw new Error(
                "SimplyBook requiere 2FA pero no devolvió auth_session_id."
            );
        }

        return {
            status: "TWO_FACTOR_REQUIRED",
            company: tokenEntity.company,
            authSessionId: tokenEntity.auth_session_id,
            allowedProviders:
                tokenEntity.allowed2faproviders ?? [],
        };
    }

    if (!tokenEntity.token) {
        throw new Error(
            "SimplyBook no devolvió el token de acceso."
        );
    }

    if (!tokenEntity.refresh_token) {
        throw new Error(
            "SimplyBook no devolvió el refresh token."
        );
    }

    return {
        status: "CONNECTED",
        tokenEntity,
    };
}

export async function verifySimplyBookTwoFactor(
    baseUrl: string,
    input: SimplyBookTwoFactorInput
): Promise<SimplyBookTokenEntity> {
    const result =
        await simplyBookRequest<SimplyBookTokenEntity>(
            baseUrl,
            "/admin/auth/2fa",
            {
                method: "POST",
                body: input,
            }
        );

    if (!result.token || !result.refresh_token) {
        throw new Error(
            "SimplyBook no devolvió tokens después de validar el segundo factor."
        );
    }

    return result;
}

export async function requestSimplyBookSmsCode(
    baseUrl: string,
    input: {
        company: string;
        sessionId: string;
    }
): Promise<void> {
    const query = new URLSearchParams({
        company: input.company,
        session_id: input.sessionId,
    });

    await simplyBookRequest<unknown>(
        baseUrl,
        `/admin/auth/sms?${query.toString()}`,
        {
            method: "GET",
        }
    );
}

export async function refreshSimplyBookAdminToken(
    baseUrl: string,
    input: SimplyBookRefreshTokenInput
): Promise<SimplyBookTokenEntity> {
    const result =
        await simplyBookRequest<SimplyBookTokenEntity>(
            baseUrl,
            "/admin/auth/refresh-token",
            {
                method: "POST",
                body: input,
            }
        );

    if (!result.token || !result.refresh_token) {
        throw new Error(
            "SimplyBook no devolvió nuevos tokens."
        );
    }

    return result;
}

export async function logoutSimplyBookAdmin(
    baseUrl: string,
    input: SimplyBookLogoutInput
): Promise<void> {
    await simplyBookRequest<unknown>(
        baseUrl,
        "/admin/auth/logout",
        {
            method: "POST",
            body: input,
        }
    );
}