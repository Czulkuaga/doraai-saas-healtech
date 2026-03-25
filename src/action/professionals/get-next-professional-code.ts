"use server";

import { requireTenantId } from "@/lib/auth/session";
import { peekNextNumberRangeCode } from "@/lib/number-range";
import { NumberRangeObject } from "../../../generated/prisma/client";

export async function getNextProfessionalCodeAction() {
    const tenantId = await requireTenantId();

    const code = await peekNextNumberRangeCode({
        tenantId,
        object: NumberRangeObject.BUSINESS_PARTNER,
        defaultPrefix: "BP",
        defaultPadding: 6,
        defaultNextNo: 1,
    });

    return code;
}