import type { PreventiveFieldType } from "../../../../../generated/prisma/enums";

export type PreventiveTemplateFieldFormValues = {
    key: string;
    label: string;
    type: PreventiveFieldType;
    required: boolean;
    order: number;
    configText?: string | null;
};

export type PreventiveTemplateFieldListItem = {
    id: string;
    key: string;
    label: string;
    type: PreventiveFieldType;
    required: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
    optionsCount: number;
};