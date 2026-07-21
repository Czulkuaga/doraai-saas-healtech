export type SimplyBookTokenResult = {
    token: string;
    expiresAt: Date | null;
};

export type SimplyBookCustomer = {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
};

export type SimplyBookCustomerSearchInput = {
    email?: string | null;
    phone?: string | null;
    nationalNumber?: string | null;
};

export type SimplyBookCustomerUpdateInput = {
    name?: string;
    email?: string;
    phone?: string;
};

export type SimplyBookCustomerSearchResult =
    | {
        status: "FOUND";
        customer: SimplyBookCustomer;
    }
    | {
        status: "NOT_FOUND";
    }
    | {
        status: "AMBIGUOUS";
        customers: SimplyBookCustomer[];
    };


export type SimplyBookAdminAuthInput = {
    company: string;
    login: string;
    password: string;
};

export type SimplyBookTokenEntity = {
    token: string;
    company: string;
    login: string;
    refresh_token: string;
    domain: string;
    require2fa: boolean;
    allowed2faproviders: string[];
    auth_session_id: string;
};

export type SimplyBookRefreshTokenInput = {
    company: string;
    refresh_token: string;
    device_token: string;
};

export type SimplyBookTwoFactorInput = {
    company: string;
    session_id: string;
    type: string;
    code: string;
};

export type SimplyBookLogoutInput = {
    auth_token: string;
};

export type SimplyBookConnectionStatus =
    | "CONNECTED"
    | "TWO_FACTOR_REQUIRED";

export type SimplyBookAuthenticationMethod =
    | "API_USER_KEY"
    | "USER_PASSWORD";

export type SimplyBookConnectInput = {
    displayName?: string;
    apiBaseUrl: string;
    company: string;
    login: string;

    authMethod: SimplyBookAuthenticationMethod;

    apiUserKey?: string;
    password?: string;
};

export type SimplyBookConnectResult =
    | {
        status: "CONNECTED";
        tokenEntity: SimplyBookTokenEntity;
    }
    | {
        status: "TWO_FACTOR_REQUIRED";
        company: string;
        authSessionId: string;
        allowedProviders: string[];
    };

export type SimplyBookVerifyTwoFactorInput = {
    type: string;
    code: string;
};

export type SimplyBookConnectionSummary = {
    configured: boolean;

    status:
    | "NOT_CONFIGURED"
    | "CONNECTING"
    | "CONNECTED"
    | "TWO_FACTOR_REQUIRED"
    | "EXPIRED"
    | "ERROR"
    | "DISABLED";

    authMethod:
    | "API_USER_KEY"
    | "USER_PASSWORD"
    | null;

    displayName: string | null;
    companyLogin: string | null;
    userLogin: string | null;
    apiBaseUrl: string | null;
    domain: string | null;

    hasApiUserKey: boolean;
    hasPassword: boolean;
    hasAccessToken: boolean;
    hasRefreshToken: boolean;

    require2fa: boolean;
    allowed2faProviders: string[];

    connectedAt: string | null;
    lastValidatedAt: string | null;

    lastErrorCode: string | null;
    lastErrorMessage: string | null;
};

export type SimplyBookApiErrorBody = {
    message?: string;
    error?: string;
    errors?: Record<string, unknown>;
};