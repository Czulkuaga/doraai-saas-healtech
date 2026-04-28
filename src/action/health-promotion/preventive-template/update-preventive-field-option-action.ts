
"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { preventiveFieldOptionSchema, type PreventiveFieldOptionInput } from "@/lib/zod/private/health-promotion/preventive-template/preventive-field-option.schema";

export async function updatePreventiveFieldOptionAction(
    templateId: string,
    versionId: string,
    sectionId: string,
    fieldId: string,
    optionId: string,
    input: PreventiveFieldOptionInput
) {
    const tenantId = await requireTenantId();

    const parsed = preventiveFieldOptionSchema.safeParse(input);
    if (!parsed.success) {
        return {
            ok: false as const,
            errors: parsed.error.flatten().fieldErrors,
            message: "Veuillez corriger les erreurs du formulaire.",
        };
    }

    const data = parsed.data;

    const current = await prisma.preventiveFieldOption.findFirst({
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
        },
    });

    if (!current) return { ok: false as const, message: "Option introuvable." };

    if (current.field.version.status !== "DRAFT") {
        return { ok: false as const, message: "Seules les versions brouillon peuvent être modifiées." };
    }

    const duplicated = await prisma.preventiveFieldOption.findFirst({
        where: { fieldId, key: data.key, NOT: { id: optionId } },
        select: { id: true },
    });

    if (duplicated) {
        return { ok: false as const, message: "Une autre option utilise déjà cette clé." };
    }

    await prisma.preventiveFieldOption.update({
        where: { id: optionId },
        data: {
            key: data.key,
            label: data.label,
            order: data.order,
        },
    });

    revalidatePath(`/medical-record/health-promotion/templates/${templateId}/versions/${versionId}/sections/${sectionId}/fields/${fieldId}`);

    return { ok: true as const, message: "Option mise à jour avec succès." };
}