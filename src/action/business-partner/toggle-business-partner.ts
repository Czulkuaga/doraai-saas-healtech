"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import type { BusinessPartnerActionState } from "@/lib/types/business-partner/business-partner.types";

export async function toggleBusinessPartnerStatusAction(
    id: string
): Promise<BusinessPartnerActionState> {
    const tenantId = await requireTenantId();

    const bp = await prisma.businessPartner.findFirst({
        where: { id, tenantId },
        select: { id: true, isActive: true },
    });

    if (!bp) {
        return {
            ok: false,
            message: "Tiers introuvable.",
        };
    }

    await prisma.businessPartner.update({
        where: { id: bp.id },
        data: {
            isActive: !bp.isActive,
        },
    });

    revalidatePath("/business-partner");
    revalidatePath(`/business-partner/${id}`);
    revalidatePath(`/business-partner/${id}/edit`);

    return {
        ok: true,
        id,
        message: bp.isActive
            ? "Le tiers a été désactivé."
            : "Le tiers a été activé.",
    };
}