import { BPRoleType, PartnerType } from "../../../../generated/prisma/enums";

export const PARTNER_TYPE_OPTIONS: Array<{
    value: PartnerType;
    labelEs: string;
    labelFr: string;
}> = [
        {
            value: PartnerType.PERSON,
            labelEs: "Persona",
            labelFr: "Personne",
        },
        {
            value: PartnerType.ORGANIZATION,
            labelEs: "Organización",
            labelFr: "Organisation",
        },
    ];

export const BP_ROLE_OPTIONS: Array<{
    value: BPRoleType;
    labelEs: string;
    labelFr: string;
}> = [
        {
            value: BPRoleType.PATIENT,
            labelEs: "Paciente",
            labelFr: "Patient",
        },
        {
            value: BPRoleType.GUARDIAN,
            labelEs: "Acudiente",
            labelFr: "Responsable",
        },
        {
            value: BPRoleType.EMERGENCY_CONTACT,
            labelEs: "Contacto de emergencia",
            labelFr: "Contact d’urgence",
        },
        {
            value: BPRoleType.PROVIDER,
            labelEs: "Profesional de salud",
            labelFr: "Professionnel de santé",
        },
        {
            value: BPRoleType.REFERRING_PROVIDER,
            labelEs: "Profesional remitente",
            labelFr: "Professionnel référent",
        },
        {
            value: BPRoleType.INSURER,
            labelEs: "Aseguradora",
            labelFr: "Assureur",
        },
        {
            value: BPRoleType.PAYER,
            labelEs: "Pagador",
            labelFr: "Payeur",
        },
        {
            value: BPRoleType.SUPPLIER,
            labelEs: "Proveedor",
            labelFr: "Fournisseur",
        },
        {
            value: BPRoleType.LABORATORY,
            labelEs: "Laboratorio",
            labelFr: "Laboratoire",
        },
        {
            value: BPRoleType.PHARMACY,
            labelEs: "Farmacia",
            labelFr: "Pharmacie",
        },
        {
            value: BPRoleType.CONTACT,
            labelEs: "Contacto",
            labelFr: "Contact",
        },
    ];