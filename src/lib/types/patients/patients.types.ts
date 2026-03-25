import { PartnerType } from "../../../../generated/prisma/enums";

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
    roles: string[];
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