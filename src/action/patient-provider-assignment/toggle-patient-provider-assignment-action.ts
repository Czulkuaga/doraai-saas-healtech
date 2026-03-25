"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function togglePatientProviderAssignmentAction(id: string) {
    const tenantId = await requireTenantId();

    const current = await prisma.patientProviderAssignment.findFirst({
        where: { id, tenantId },
        select: {
            id: true,
            isActive: true,
            isPrimary: true,
        },
    });

    if (!current) {
        return {
            ok: false as const,
            message: "Affectation introuvable.",
        };
    }

    const nextIsActive = !current.isActive;

    await prisma.patientProviderAssignment.update({
        where: { id },
        data: {
            isActive: nextIsActive,
            isPrimary: nextIsActive ? current.isPrimary : false,
            endDate: nextIsActive ? null : new Date(),
        },
    });

    revalidatePath("/organization/patient-assignments");

    return {
        ok: true as const,
        message: nextIsActive
            ? "Affectation activée avec succès."
            : "Affectation désactivée avec succès.",
    };
}