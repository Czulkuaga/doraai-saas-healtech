import type { PreventiveTemplateStatusValue } from "./preventive-template.types";

export const PREVENTIVE_TEMPLATE_STATUS_OPTIONS: Array<{
    value: PreventiveTemplateStatusValue;
    labelFr: string;
}> = [
    { value: "DRAFT", labelFr: "Brouillon" },
    { value: "PUBLISHED", labelFr: "Publié" },
    { value: "ARCHIVED", labelFr: "Archivé" },
];