"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import {
    preventiveTemplateFieldSchema,
    type PreventiveTemplateFieldInput,
} from "@/lib/zod/private/health-promotion/preventive-template/preventive-template-field.schema";

function parseConfig(configText?: string | null) {
    if (!configText) return undefined;
    return JSON.parse(configText);
}

export async function updatePreventiveTemplateFieldAction(
    templateId: string,
    versionId: string,
    sectionId: string,
    fieldId: string,
    input: PreventiveTemplateFieldInput
) {
    const tenantId = await requireTenantId();

    const parsed = preventiveTemplateFieldSchema.safeParse(input);

    if (!parsed.success) {
        return {
            ok: false as const,
            errors: parsed.error.flatten().fieldErrors,
            message: "Veuillez corriger les erreurs du formulaire.",
        };
    }

    const data = parsed.data;

    const current = await prisma.preventiveTemplateField.findFirst({
        where: {
            id: fieldId,
            tenantId,
            versionId,
            sectionId,
            version: {
                templateId,
            },
        },
        select: {
            id: true,
            version: {
                select: {
                    status: true,
                },
            },
        },
    });

    if (!current) {
        return {
            ok: false as const,
            message: "Champ introuvable.",
        };
    }

    if (current.version.status !== "DRAFT") {
        return {
            ok: false as const,
            message: "Seules les versions brouillon peuvent être modifiées.",
        };
    }

    const duplicated = await prisma.preventiveTemplateField.findFirst({
        where: {
            versionId,
            key: data.key,
            NOT: {
                id: fieldId,
            },
        },
        select: {
            id: true,
        },
    });

    if (duplicated) {
        return {
            ok: false as const,
            message: "Un autre champ utilise déjà cette clé.",
        };
    }

    await prisma.preventiveTemplateField.update({
        where: {
            id: fieldId,
        },
        data: {
            key: data.key,
            label: data.label,
            type: data.type,
            required: data.required,
            order: data.order,
            config: data.configText ? parseConfig(data.configText) : undefined,
        },
    });

    revalidatePath(
        `/medical-record/health-promotion/templates/${templateId}/versions/${versionId}`
    );
    revalidatePath(
        `/medical-record/health-promotion/templates/${templateId}/versions/${versionId}/sections/${sectionId}`
    );
    revalidatePath(
        `/medical-record/health-promotion/templates/${templateId}/versions/${versionId}/sections/${sectionId}/fields/${fieldId}/edit`
    );

    return {
        ok: true as const,
        message: "Le champ a été mis à jour avec succès.",
    };
}