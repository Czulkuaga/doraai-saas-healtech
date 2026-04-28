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

export async function createPreventiveTemplateFieldAction(
    templateId: string,
    versionId: string,
    sectionId: string,
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

    const section = await prisma.preventiveTemplateSection.findFirst({
        where: {
            id: sectionId,
            tenantId,
            versionId,
            version: {
                templateId,
            },
        },
        select: {
            id: true,
            version: {
                select: {
                    id: true,
                    status: true,
                },
            },
        },
    });

    if (!section) {
        return {
            ok: false as const,
            message: "Section introuvable.",
        };
    }

    if (section.version.status !== "DRAFT") {
        return {
            ok: false as const,
            message: "Uniquement les versions en brouillon peuvent être modifiées.",
        };
    }

    const duplicated = await prisma.preventiveTemplateField.findFirst({
        where: {
            versionId,
            key: data.key,
        },
        select: {
            id: true,
        },
    });

    if (duplicated) {
        return {
            ok: false as const,
            message: "Un champ avec cette clé existe déjà dans cette version.",
        };
    }

    const created = await prisma.preventiveTemplateField.create({
        data: {
            tenantId,
            versionId,
            sectionId,
            key: data.key,
            label: data.label,
            type: data.type,
            required: data.required,
            order: data.order,
            ...(data.configText ? { config: parseConfig(data.configText) } : {}),
        },
        select: {
            id: true,
        },
    });

    revalidatePath(
        `/medical-record/health-promotion/templates/${templateId}/versions/${versionId}`
    );
    revalidatePath(
        `/medical-record/health-promotion/templates/${templateId}/versions/${versionId}/sections/${sectionId}`
    );

    return {
        ok: true as const,
        message: "Le champ a été créé avec succès.",
        id: created.id,
    };
}