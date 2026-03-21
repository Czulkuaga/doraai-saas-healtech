"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import type { BusinessPartnerDetails } from "@/lib/types/business-partner/business-partner.types";

export async function getBusinessPartnerByIdAction(
    id: string
): Promise<BusinessPartnerDetails | null> {
    const tenantId = await requireTenantId();

    const bp = await prisma.businessPartner.findFirst({
        where: {
            id,
            tenantId,
        },
        include: {
            roles: {
                select: { role: true },
                orderBy: { role: "asc" },
            },
        },
    });

    if (!bp) return null;

    return {
        ...bp,
        roles: bp.roles.map((x) => x.role),
    };
}