import type { PatientProviderAssignmentTypeValue } from "./patient-provider-assignment.types";

export const PATIENT_PROVIDER_ASSIGNMENT_TYPE_OPTIONS: Array<{
    value: PatientProviderAssignmentTypeValue;
    labelFr: string;
    labelEs: string;
}> = [
    {
        value: "PRIMARY_CARE",
        labelFr: "Référent principal",
        labelEs: "Referente principal",
    },
    {
        value: "PREVENTIVE_FOLLOWUP",
        labelFr: "Suivi préventif",
        labelEs: "Seguimiento preventivo",
    },
    {
        value: "NURSING",
        labelFr: "Suivi infirmier",
        labelEs: "Seguimiento de enfermería",
    },
    {
        value: "SPECIALIST_SUPPORT",
        labelFr: "Appui spécialisé",
        labelEs: "Apoyo especializado",
    },
    {
        value: "OTHER",
        labelFr: "Autre",
        labelEs: "Otro",
    },
];