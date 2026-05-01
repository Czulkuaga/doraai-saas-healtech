import {
    PreventiveCaseStatus,
    PreventiveFieldType,
    PreventiveValueKind,
} from "../../../../../generated/prisma/enums";

export type PreventiveCaseSortBy =
    | "code"
    | "patient"
    | "template"
    | "status"
    | "openedAt";

export type PreventiveCaseSortDir = "asc" | "desc";

export type PreventiveCaseQuery = {
    q?: string;
    status?: PreventiveCaseStatus | "";
    page: number;
    pageSize: number;
    sortBy: PreventiveCaseSortBy;
    sortDir: PreventiveCaseSortDir;
};

export type PreventiveCaseListItem = {
    id: string;
    code: string;
    status: PreventiveCaseStatus;
    openedAt: Date;
    completedAt: Date | null;
    cancelledAt: Date | null;
    patientName: string;
    templateName: string;
    providerName?: string | null;
};

export type PreventiveCaseOptionItem = {
    id: string;
    key: string;
    label: string;
    order: number;
};

export type PreventiveCaseFieldItem = {
    id: string;
    key: string;
    label: string;
    type: PreventiveFieldType;
    required: boolean;
    order: number;
    config: unknown;
    options: PreventiveCaseOptionItem[];
};

export type PreventiveCaseSectionItem = {
    id: string;
    key: string;
    title: string;
    order: number;
    fields: PreventiveCaseFieldItem[];
};

export type PreventiveCaseAnswerValue = {
    id: string;
    fieldId: string;
    kind: PreventiveValueKind;
    valueString: string | null;
    valueNumber: string | null;
    valueBoolean: boolean | null;
    valueDate: Date | null;
    valueDateTime: Date | null;
    valueJson: unknown | null;
    optionId: string | null;
    optionIds: string[];
};

export type PreventiveCaseEditorData = {
    id: string;
    code: string;
    status: PreventiveCaseStatus;
    notes: string | null;
    patientName: string;
    templateName: string;
    sections: PreventiveCaseSectionItem[];
    values: PreventiveCaseAnswerValue[];
};