"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { BPRoleType } from "../../../generated/prisma/enums";
import type { PatientActionState } from "@/lib/types/patients/patients.types";

export async function togglePatientStatusAction(
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
        select: { id: true, isActive: true },
    });

    if (!item) {
        return {
            ok: false,
            message: "Patient introuvable.",
        };
    }

    await prisma.businessPartner.update({
        where: { id: item.id },
        data: {
            isActive: !item.isActive,
        },
    });

    revalidatePath("/medical-record/patients");
    revalidatePath(`/medical-record/patients/${id}`);
    revalidatePath(`/medical-record/patients/${id}/edit`);

    return {
        ok: true,
        id,
        message: item.isActive
            ? "Le patient a été désactivé."
            : "Le patient a été activé.",
    };
}