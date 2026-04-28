import type { PreventiveTemplateStatusValue } from "./preventive-template.types";

export type PreventiveTemplateFormValues = {
    code: string;
    name: string;
    description?: string | null;
    serviceTypeId?: string | null;
    specialtyId?: string | null;
    status: PreventiveTemplateStatusValue;
    isActive: boolean;
};

export type PreventiveTemplateFormOption = {
    value: string;
    label: string;
};