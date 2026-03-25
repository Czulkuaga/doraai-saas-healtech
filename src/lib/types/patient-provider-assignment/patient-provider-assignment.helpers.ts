import type {
    PatientProviderAssignmentListItem,
    PatientProviderAssignmentTypeValue,
} from "./patient-provider-assignment.types";

export function getPatientProviderAssignmentTypeLabel(
    type: PatientProviderAssignmentTypeValue
) {
    switch (type) {
        case "PRIMARY_CARE":
            return "Référent principal";
        case "PREVENTIVE_FOLLOWUP":
            return "Suivi préventif";
        case "NURSING":
            return "Suivi infirmier";
        case "SPECIALIST_SUPPORT":
            return "Appui spécialisé";
        case "OTHER":
            return "Autre";
        default:
            return type;
    }
}

export function getPatientProviderAssignmentInitials(
    item: Pick<PatientProviderAssignmentListItem, "patient" | "provider">
) {
    const base = `${item.patient.label} ${item.provider.label}`.trim();
    const parts = base.split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((x) => x[0]?.toUpperCase() ?? "").join("") || "PP";
}