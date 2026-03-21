import { PartnerType } from "../../../../generated/prisma/enums";
import type {
    BusinessPartnerDetails,
    BusinessPartnerFormDefaults,
} from "./business-partner.types";

function toDateInput(value?: Date | null) {
    if (!value) return "";
    const d = new Date(value);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function getBusinessPartnerFormDefaults(
    item?: BusinessPartnerDetails | null
): BusinessPartnerFormDefaults {
    return {
        id: item?.id,
        type: item?.type ?? PartnerType.PERSON,
        code: item?.code ?? "",
        isActive: item?.isActive ?? true,
        firstName: item?.firstName ?? "",
        lastName: item?.lastName ?? "",
        organizationName: item?.organizationName ?? "",
        email: item?.email ?? "",
        phone: item?.phone ?? "",
        birthDate: toDateInput(item?.birthDate),
        roles: item?.roles ?? [],
    };
}