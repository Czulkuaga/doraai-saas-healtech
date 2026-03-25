"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { BPRoleType } from "../../../generated/prisma/enums";
import type { PatientActionState } from "@/lib/types/patients/patients.types";

export async function deletePatientAction(
    id: string
): Promise<PatientActionState> {
    const tenantId = await requireTenantId();

    const item = await prisma.businessPartner.findFirst({
        where: {
            id,
            tenantId,
            roles: {
                some: {
                    tenantId,
                    role: BPRoleType.PATIENT,
                },
            },
        },
        select: { id: true },
    });

    if (!item) {
        return {
            ok: false,
            message: "Patient introuvable.",
        };
    }

    try {
        await prisma.$transaction(async (tx) => {
            await tx.businessPartnerRole.deleteMany({
                where: {
                    tenantId,
                    partnerId: id,
                    role: BPRoleType.PATIENT,
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

        revalidatePath("/medical-record/patients");

        return {
            ok: true,
            id,
            message: "Patient supprimé avec succès.",
        };
    } catch (error) {
        console.error("deletePatientAction", error);

        return {
            ok: false,
            message:
                "Impossible de supprimer ce patient. Il est probablement utilisé dans d’autres enregistrements.",
        };
    }
}