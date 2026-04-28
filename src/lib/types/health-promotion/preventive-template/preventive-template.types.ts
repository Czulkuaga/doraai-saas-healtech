export type PreventiveTemplateStatusValue =
    | "DRAFT"
    | "PUBLISHED"
    | "ARCHIVED";

export type PreventiveTemplateListItem = {
    id: string;
    code: string;
    name: string;
    status: PreventiveTemplateStatusValue;
    isActive: boolean;

    serviceTypeId: string | null;
    specialtyId: string | null;

    serviceTypeName: string | null;
    specialtyName: string | null;

    publishedVersionId: string | null;
    publishedVersionNumber: number | null;

    totalVersions: number;
    createdAt: string;
    updatedAt: string;
};

export type PreventiveTemplateFilters = {
    q?: string;
    status?: PreventiveTemplateStatusValue | "";
    isActive?: "true" | "false" | "";
    page?: number;
    pageSize?: number;
};