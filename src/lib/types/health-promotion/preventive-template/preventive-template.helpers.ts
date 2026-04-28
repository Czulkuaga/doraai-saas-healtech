import type { PreventiveTemplateStatusValue } from "./preventive-template.types";

export function getPreventiveTemplateStatusLabel(
    status: PreventiveTemplateStatusValue
) {
    switch (status) {
        case "DRAFT":
            return "Brouillon";
        case "PUBLISHED":
            return "Publié";
        case "ARCHIVED":
            return "Archivé";
        default:
            return status;
    }
}

export function getPreventiveTemplateInitials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((x) => x[0]?.toUpperCase() ?? "").join("") || "PT";
}