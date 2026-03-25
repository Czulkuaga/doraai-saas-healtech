"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { BPRoleType } from "../../../generated/prisma/enums";
import type { ProfessionalActionState } from "@/lib/types/professionals/professionals.types";

export async function deleteProfessionalAction(
    id: string
): Promise<ProfessionalActionState> {
    const tenantId = await requireTenantId();

    const item = await prisma.businessPartner.findFirst({
        where: {
            id,
            tenantId,
            roles: {
                some: {
                    tenantId,
                    role: BPRoleType.PROVIDER,
                },
            },
        },
        select: { id: true },
    });

    if (!item) {
        return {
            ok: false,
            message: "Professionnel introuvable.",
        };
    }

    try {
        await prisma.$transaction(async (tx) => {
            await tx.businessPartnerRole.deleteMany({
                where: {
                    tenantId,
                    partnerId: id,
                    role: BPRoleType.PROVIDER,
                },
            });

            const otherRoles = await tx.businessPartnerRole.count({
                where: {
                    tenantId,
                    partnerId: id,
                },
            });

            if (otherRoles === 0) {
                await tx.businessPartner.delete({
                    where: { id },
                });
            }
        });

        revalidatePath("/medical-record/professionals");

        return {
            ok: true,
            id,
            message: "Professionnel supprimé avec succès.",
        };
    } catch (error) {
        console.error("deleteProfessionalAction", error);

        return {
            ok: false,
            message:
                "Impossible de supprimer ce professionnel. Il est probablement utilisé dans d’autres enregistrements.",
        };
    }
}