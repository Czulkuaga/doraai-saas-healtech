"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import {
    preventiveTemplateSectionSchema,
    type PreventiveTemplateSectionInput,
} from "@/lib/zod/private/health-promotion/preventive-template/preventive-template-section.schema";

export async function updatePreventiveTemplateSectionAction(
    templateId: string,
    versionId: string,
    sectionId: string,
    input: PreventiveTemplateSectionInput
) {
    const tenantId = await requireTenantId();

    const parsed = preventiveTemplateSectionSchema.safeParse(input);

    if (!parsed.success) {
        return {
            ok: false as const,
            errors: parsed.error.flatten().fieldErrors,
            message: "Veuillez corriger les erreurs du formulaire.",
        };
    }

    const data = parsed.data;

    const current = await prisma.preventiveTemplateSection.findFirst({
        where: {
            id: sectionId,
            versionId,
            tenantId,
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
            message: "Section introuvable.",
        };
    }

    if (current.version.status !== "DRAFT") {
        return {
            ok: false as const,
            message: "Seules les versions brouillon peuvent être modifiées.",
        };
    }

    const duplicated = await prisma.preventiveTemplateSection.findFirst({
        where: {
            versionId,
            key: data.key,
            NOT: {
                id: sectionId,
            },
        },
        select: {
            id: true,
        },
    });

    if (duplicated) {
        return {
            ok: false as const,
            message: "Une autre section utilise déjà cette clé.",
        };
    }

    await prisma.preventiveTemplateSection.update({
        where: {
            id: sectionId,
        },
        data: {
            key: data.key,
            title: data.title,
            order: data.order,
        },
    });

    revalidatePath(
        `/medical-record/health-promotion/templates/${templateId}/versions/${versionId}`
    );
    revalidatePath(
        `/medical-record/health-promotion/templates/${templateId}/versions/${versionId}/sections/${sectionId}/edit`
    );

    return {
        ok: true as const,
        message: "La section a été mise à jour avec succès.",
    };
}