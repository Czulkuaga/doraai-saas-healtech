import { PartnerType } from "../../../../generated/prisma/enums";

export function getPatientDisplayName(input: {
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

export function getPatientInitials(input: {
    type: PartnerType;
    firstName?: string | null;
    lastName?: string | null;
    organizationName?: string | null;
    code?: string | null;
}) {
    if (input.type === PartnerType.ORGANIZATION) {
        const source = input.organizationName?.trim() || input.code?.trim() || "PT";
        return source
            .split(/\s+/)
            .slice(0, 2)
            .map((x) => x[0]?.toUpperCase() ?? "")
            .join("");
    }

    const source = [input.firstName, input.lastName].filter(Boolean).join(" ").trim();

    if (!source) {
        return (input.code?.slice(0, 2) || "PT").toUpperCase();
    }

    return source
        .split(/\s+/)
        .slice(0, 2)
        .map((x) => x[0]?.toUpperCase() ?? "")
        .join("");
}

export function getPatientTypeLabel(type: PartnerType): string {
    switch (type) {
        case PartnerType.PERSON:
            return "Informations patient";
        case PartnerType.ORGANIZATION:
            return "Organisation";
        default:
            return type;
    }
}