import {
    AddressType,
    BPRoleType,
    Gender,
    IdentityDocumentType,
    InsuranceVerificationStatus,
    PartnerType,
} from "../../../../generated/prisma/enums";

import type { Prisma } from "../../../../generated/prisma/client";

export type PatientStatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

export type PatientSort =
    | "recent"
    | "oldest"
    | "name_asc"
    | "name_desc"
    | "code_asc"
    | "code_desc";

export type PatientFilters = {
    q?: string;
    type?: PartnerType | "ALL";
    status?: PatientStatusFilter;
    sort?: PatientSort;
    page?: number;
    pageSize?: number;
};

export type PatientListItem = {
    id: string;
    tenantId: string;
    code: string;
    type: PartnerType;
    isActive: boolean;
    firstName: string | null;
    lastName: string | null;
    organizationName: string | null;
    email: string | null;
    emailNormalized: string | null;
    phone: string | null;
    phoneNormalized: string | null;
    birthDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

export type PatientDetails = PatientListItem & {
    gender: Gender | null;
    nationalityCode: string | null;
    preferredLanguageCode: string | null;
    deceasedAt: Date | null;

    nationality: PatientCountryDetails | null;
    preferredLanguage: PatientLocaleDetails | null;

    addresses: PatientAddressDetails[];
    identities: PatientIdentityDetails[];
    insuranceCoverages: PatientInsuranceCoverageDetails[];

    roles: BPRoleType[];
};

export type PatientCountryDetails = {
    code: string;
    name: string;
};

export type PatientLocaleDetails = {
    code: string;
    name: string;
    language: string;
    region: string | null;
};

export type PatientAddressDetails = {
    id: string;
    type: AddressType;
    isPrimary: boolean;
    street: string | null;
    houseNumber: string | null;
    box: string | null;
    postalCode: string | null;
    city: string | null;
    region: string | null;
    countryCode: string | null;
    rawAddress: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export type PatientIdentityDetails = {
    id: string;
    type: IdentityDocumentType;
    nationalNumber: string | null;
    nationalNumberNormalized: string | null;
    cardNumber: string | null;
    cardNumberNormalized: string | null;
    issuingCountryCode: string | null;
    nationalityCode: string | null;
    validFrom: Date | null;
    expiresAt: Date | null;
    readAt: Date | null;
    source: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export type PatientInsuranceCoverageDetails = {
    id: string;
    status: InsuranceVerificationStatus;
    insurerCode: string | null;
    insurerName: string | null;
    mutualityCode: string | null;
    mutualityName: string | null;
    verifiedAt: Date | null;
    validFrom: Date | null;
    validUntil: Date | null;
    source: string | null;
    externalReference: string | null;
    alerts: Prisma.JsonValue | null;
    createdAt: Date;
    updatedAt: Date;
};

export type PatientFormValues = {
    type: PartnerType;
    code?: string;
    isActive?: boolean;
    firstName?: string;
    lastName?: string;
    organizationName?: string;
    email?: string;
    phone?: string;
    birthDate?: string;
};

export type PatientFormDefaults = {
    id?: string;
    type: PartnerType;
    code: string;
    isActive: boolean;
    firstName: string;
    lastName: string;
    organizationName: string;
    email: string;
    phone: string;
    birthDate: string;
};

export type PatientActionState =
    | {
        ok: true;
        id: string;
        message?: string;
    }
    | {
        ok: false;
        message: string;
        fieldErrors?: Record<string, string[] | undefined>;
    };