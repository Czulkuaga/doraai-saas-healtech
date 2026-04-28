
"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function deletePreventiveFieldOptionAction(
    templateId: string,
    versionId: string,
    sectionId: string,
    fieldId: string,
    optionId: string
) {
    const tenantId = await requireTenantId();

    const option = await prisma.preventiveFieldOption.findFirst({
        where: {
            id: optionId,
            tenantId,
            versionId,
            fieldId,
            field: { sectionId, version: { templateId } },
        },
        select: {
            id: true,
            field: {
                select: {
                    version: { select: { status: true } },
                },
            },
            _count: {
                select: {
                    singleSelectValues: true,
                    multiSelectLinks: true,
                },
            },
        },
    });

    if (!option) return { ok: false as const, message: "Option introuvable." };

    if (option.field.version.status !== "DRAFT") {
        return { ok: false as const, message: "Seules les versions brouillon peuvent être modifiées." };
    }

    if (option._count.singleSelectValues > 0 || option._count.multiSelectLinks > 0) {
        return {
            ok: false as const,
            message: "Cette option est déjà utilisée et ne peut pas être supprimée.",
        };
    }

    await prisma.preventiveFieldOption.delete({
        where: { id: optionId },
    });

    revalidatePath(`/medical-record/health-promotion/templates/${templateId}/versions/${versionId}/sections/${sectionId}/fields/${fieldId}`);

    return { ok: true as const, message: "Option supprimée avec succès." };
}