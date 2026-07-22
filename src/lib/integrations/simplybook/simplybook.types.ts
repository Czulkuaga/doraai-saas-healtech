export type SimplyBookTokenResult = {
    token: string;
    expiresAt: Date | null;
};

// export type SimplyBookCustomer = {
//     id: string;
//     name: string | null;
//     email: string | null;
//     phone: string | null;
// };

// export type SimplyBookCustomerSearchInput = {
//     email?: string | null;
//     phone?: string | null;
//     nationalNumber?: string | null;
// };

// export type SimplyBookCustomerUpdateInput = {
//     name?: string;
//     email?: string;
//     phone?: string;
// };

// export type SimplyBookCustomerSearchResult =
//     | {
//         status: "FOUND";
//         customer: SimplyBookCustomer;
//     }
//     | {
//         status: "NOT_FOUND";
//     }
//     | {
//         status: "AMBIGUOUS";
//         customers: SimplyBookCustomer[];
//     };


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

export type SimplyBookBooleanLike =
    | boolean
    | 0
    | 1
    | "0"
    | "1";

export type SimplyBookAdminClient = {
    can_be_edited: SimplyBookBooleanLike;
    is_deleted: SimplyBookBooleanLike;

    email_promo_subscribed: SimplyBookBooleanLike;
    sms_promo_subscribed: SimplyBookBooleanLike;

    id: number;

    name: string;
    email: string;
    phone: string;

    address1: string;
    address2: string;

    city: string;
    zip: string;

    country_id: string;
    state_id: number;
};

export type SimplyBookAdminClientsMetadata = {
    items_count: number;
    pages_count: number;
    page: number;
};

export type SimplyBookAdminClientsResponse = {
    data: SimplyBookAdminClient[];

    metadata: SimplyBookAdminClientsMetadata;
};

export type SimplyBookAdminClientSearchParams = {
    search: string;

    page?: number;
    onPage?: number;
};

export type MedicloudPatientForSimplyBook = {
    partnerId: string;
    code: string;

    firstName: string | null;
    lastName: string | null;

    email: string | null;
    emailNormalized: string | null;

    phone: string | null;
    phoneNormalized: string | null;

    birthDate: Date | null;

    gender: string | null;

    nationalityCode: string | null;
    preferredLanguageCode: string | null;

    identity: {
        id: string;
        type: string;

        nationalNumber: string | null;
        nationalNumberNormalized: string | null;

        cardNumber: string | null;
        cardNumberNormalized: string | null;

        nationalityCode: string | null;
        issuingCountryCode: string | null;
    } | null;

    address: {
        id: string;

        street: string | null;
        houseNumber: string | null;
        box: string | null;

        postalCode: string | null;
        city: string | null;
        region: string | null;
        countryCode: string | null;

        rawAddress: string | null;
    } | null;
};

export type SimplyBookMatchField =
    | "DOCUMENT"
    | "EMAIL"
    | "PHONE"
    | "BIRTH_DATE"
    | "NAME";

export type SimplyBookMatchConflict =
    | "DOCUMENT"
    | "EMAIL"
    | "PHONE"
    | "BIRTH_DATE"
    | "NAME";

export type SimplyBookCustomerMatchEvaluation = {
    score: number;

    matchedBy: SimplyBookMatchField[];

    conflicts: SimplyBookMatchConflict[];

    hasHardConflict: boolean;
};

export type SimplyBookCustomerCandidate = {
    customer: SimplyBookAdminClient;

    score: number;

    matchedBy: SimplyBookMatchField[];

    conflicts: SimplyBookMatchConflict[];

    hasHardConflict: boolean;
};

export type ResolveSimplyBookPatientResult =
    | {
        status: "LINKED";

        externalCustomerId: string;

        source: "EXISTING_LINK";
    }
    | {
        status: "FOUND";

        externalCustomerId: string;

        confidence: "HIGH";

        matchedBy: SimplyBookMatchField[];

        customer: SimplyBookAdminClient;
    }
    | {
        status: "AMBIGUOUS";

        candidates: SimplyBookCustomerCandidate[];
    }
    | {
        status: "NOT_FOUND";
    };


export type SimplyBookClientFieldOption = {
    id: string | number | null;
    value: string;
    is_default: boolean;
    position: number;
};

export type SimplyBookClientFieldDefinition = {
    id: string;
    title: string;
    default_value: string | null;
    values: SimplyBookClientFieldOption[];
    value: string;
    is_visible: boolean;
    is_optional: boolean;
    is_built_in: boolean;
    type: string;
};

export type SimplyBookClientFieldsResponse = {
    data: SimplyBookClientFieldDefinition[];
};

export type SimplyBookClientFieldValueItem = {
    id: string;

    field: SimplyBookClientFieldDefinition;

    value: string;
};

export type SimplyBookClientFieldValuesResponse = {
    id: number;

    fields: SimplyBookClientFieldValueItem[];
};