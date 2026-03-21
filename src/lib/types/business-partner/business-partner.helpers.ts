import { BPRoleType, PartnerType } from "../../../../generated/prisma/enums";

export function getPartnerTypeLabel(type: PartnerType): string {
    switch (type) {
        case PartnerType.PERSON:
            return "Personne";
        case PartnerType.ORGANIZATION:
            return "Organisation";
        default:
            return type;
    }
}

export function getBPRoleLabel(role: BPRoleType): string {
    switch (role) {
        case BPRoleType.PATIENT:
            return "Patient";
        case BPRoleType.GUARDIAN:
            return "Responsable";
        case BPRoleType.EMERGENCY_CONTACT:
            return "Contact d’urgence";
        case BPRoleType.PROVIDER:
            return "Professionnel de santé";
        case BPRoleType.REFERRING_PROVIDER:
            return "Professionnel référent";
        case BPRoleType.INSURER:
            return "Assureur";
        case BPRoleType.PAYER:
            return "Payeur";
        case BPRoleType.SUPPLIER:
            return "Fournisseur";
        case BPRoleType.LABORATORY:
            return "Laboratoire";
        case BPRoleType.PHARMACY:
            return "Pharmacie";
        case BPRoleType.CONTACT:
            return "Contact";
        default:
            return role;
    }
}

export function getBusinessPartnerDisplayName(input: {
    type: PartnerType;
    firstName?: string | null;
    lastName?: string | null;
    organizationName?: string | null;
    code?: string | null;
}) {
    if (input.type === PartnerType.ORGANIZATION) {
        return input.organizationName?.trim() || input.code || "—";
    }

    const fullName = [input.firstName, input.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

    return fullName || input.code || "—";
}

export function getBusinessPartnerInitials(input: {
    type: PartnerType;
    firstName?: string | null;
    lastName?: string | null;
    organizationName?: string | null;
    code?: string | null;
}) {
    if (input.type === PartnerType.ORGANIZATION) {
        const source = input.organizationName?.trim() || input.code?.trim() || "BP";
        return source
            .split(/\s+/)
            .slice(0, 2)
            .map((x) => x[0]?.toUpperCase() ?? "")
            .join("");
    }

    const source = [input.firstName, input.lastName].filter(Boolean).join(" ").trim();

    if (!source) {
        return (input.code?.slice(0, 2) || "BP").toUpperCase();
    }

    return source
        .split(/\s+/)
        .slice(0, 2)
        .map((x) => x[0]?.toUpperCase() ?? "")
        .join("");
}