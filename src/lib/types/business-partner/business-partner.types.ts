import { BPRoleType, PartnerType } from "../../../../generated/prisma/enums";

export type BusinessPartnerStatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

export type BusinessPartnerSort =
    | "recent"
    | "oldest"
    | "name_asc"
    | "name_desc"
    | "code_asc"
    | "code_desc";

export type BusinessPartnerFilters = {
    q?: string;
    type?: PartnerType | "ALL";
    status?: BusinessPartnerStatusFilter;
    sort?: BusinessPartnerSort;
    page?: number;
    pageSize?: number;
};

export type BusinessPartnerListItem = {
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
    roles: BPRoleType[];
};

export type BusinessPartnerDetails = BusinessPartnerListItem;

export type BusinessPartnerFormValues = {
    type: PartnerType;
    code?: string;
    isActive?: boolean;
    firstName?: string;
    lastName?: string;
    organizationName?: string;
    email?: string;
    phone?: string;
    birthDate?: string;
    roles: BPRoleType[];
};

export type BusinessPartnerFormDefaults = {
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
    roles: BPRoleType[];
};

export type BusinessPartnerActionState =
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