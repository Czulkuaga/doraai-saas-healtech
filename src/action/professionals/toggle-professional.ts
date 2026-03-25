"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { BPRoleType } from "../../../generated/prisma/enums";
import type { ProfessionalActionState } from "@/lib/types/professionals/professionals.types";

export async function toggleProfessionalStatusAction(
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
        select: { id: true, isActive: true },
    });

    if (!item) {
        return {
            ok: false,
            message: "Professionnel introuvable.",
        };
    }

    await prisma.businessPartner.update({
        where: { id: item.id },
        data: {
            isActive: !item.isActive,
        },
    });

    revalidatePath("/medical-record/professionals");
    revalidatePath(`/medical-record/professionals/${id}`);
    revalidatePath(`/medical-record/professionals/${id}/edit`);

    return {
        ok: true,
        id,
        message: item.isActive
            ? "Le professionnel a été désactivé."
            : "Le professionnel a été activé.",
    };
}