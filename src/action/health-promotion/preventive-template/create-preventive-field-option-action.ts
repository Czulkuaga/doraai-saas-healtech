
"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { preventiveFieldOptionSchema, type PreventiveFieldOptionInput } from "@/lib/zod/private/health-promotion/preventive-template/preventive-field-option.schema";
import { fieldTypeSupportsOptions } from "@/lib/types/health-promotion/preventive-template/preventive-field.helpers";

export async function createPreventiveFieldOptionAction(
    templateId: string,
    versionId: string,
    sectionId: string,
    fieldId: string,
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

    const field = await prisma.preventiveTemplateField.findFirst({
        where: { id: fieldId, tenantId, versionId, sectionId, version: { templateId } },
        select: {
            id: true,
            type: true,
            version: { select: { status: true } },
        },
    });

    if (!field) return { ok: false as const, message: "Champ introuvable." };

    if (field.version.status !== "DRAFT") {
        return { ok: false as const, message: "Seules les versions brouillon peuvent être modifiées." };
    }

    if (!fieldTypeSupportsOptions(field.type)) {
        return { ok: false as const, message: "Ce type de champ ne supporte pas les options." };
    }

    const duplicated = await prisma.preventiveFieldOption.findFirst({
        where: { fieldId, key: data.key },
        select: { id: true },
    });

    if (duplicated) {
        return { ok: false as const, message: "Une option avec cette clé existe déjà pour ce champ." };
    }

    const created = await prisma.preventiveFieldOption.create({
        data: {
            tenantId,
            versionId,
            fieldId,
            key: data.key,
            label: data.label,
            order: data.order,
        },
        select: { id: true },
    });

    revalidatePath(`/medical-record/health-promotion/templates/${templateId}/versions/${versionId}/sections/${sectionId}/fields/${fieldId}`);

    return { ok: true as const, message: "Option créée avec succès.", id: created.id };
}