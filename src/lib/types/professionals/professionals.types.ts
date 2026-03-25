import { PartnerType } from "../../../../generated/prisma/enums";

export type ProfessionalStatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

export type ProfessionalSort =
    | "recent"
    | "oldest"
    | "name_asc"
    | "name_desc"
    | "code_asc"
    | "code_desc";

export type ProfessionalFilters = {
    q?: string;
    type?: PartnerType | "ALL";
    status?: ProfessionalStatusFilter;
    sort?: ProfessionalSort;
    page?: number;
    pageSize?: number;
};

export type ProfessionalListItem = {
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

export type ProfessionalDetails = ProfessionalListItem & {
    roles: string[];
};

export type ProfessionalFormValues = {
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

export type ProfessionalFormDefaults = {
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

export type ProfessionalActionState =
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