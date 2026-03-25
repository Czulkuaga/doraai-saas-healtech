import { PatientProviderAssignmentTypeValue } from "./patient-provider-assignment.types";

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