"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import type { BusinessPartnerActionState } from "@/lib/types/business-partner/business-partner.types";

export async function deleteBusinessPartnerAction(
    id: string
): Promise<BusinessPartnerActionState> {
    const tenantId = await requireTenantId();

    const bp = await prisma.businessPartner.findFirst({
        where: { id, tenantId },
        select: { id: true },
    });

    if (!bp) {
        return {
            ok: false,
            message: "Tiers introuvable.",
        };
    }

    try {
        await prisma.$transaction(async (tx) => {
            await tx.businessPartnerRole.deleteMany({
                where: {
                    tenantId,
                    partnerId: id,
                },
            });

            await tx.businessPartner.delete({
                where: { id },
            });
        });

        revalidatePath("/business-partner");

        return {
            ok: true,
            id,
            message: "Tiers supprimé avec succès.",
        };
    } catch (error) {
        console.error("deleteBusinessPartnerAction", error);

        return {
            ok: false,
            message:
                "Impossible de supprimer ce tiers. Il est probablement utilisé dans d’autres enregistrements.",
        };
    }
}