"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import {
    preventiveTemplateSectionSchema,
    type PreventiveTemplateSectionInput,
} from "@/lib/zod/private/health-promotion/preventive-template/preventive-template-section.schema";

export async function createPreventiveTemplateSectionAction(
    templateId: string,
    versionId: string,
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

    const version = await prisma.preventiveTemplateVersion.findFirst({
        where: {
            id: versionId,
            templateId,
            tenantId,
        },
        select: {
            id: true,
            status: true,
        },
    });

    if (!version) {
        return {
            ok: false as const,
            message: "Version introuvable.",
        };
    }

    if (version.status !== "DRAFT") {
        return {
            ok: false as const,
            message: "Seules les versions brouillon peuvent être modifiées.",
        };
    }

    const duplicated = await prisma.preventiveTemplateSection.findFirst({
        where: {
            versionId,
            key: data.key,
        },
        select: { id: true },
    });

    if (duplicated) {
        return {
            ok: false as const,
            message: "Une section avec cette clé existe déjà dans cette version.",
        };
    }

    const created = await prisma.preventiveTemplateSection.create({
        data: {
            tenantId,
            versionId,
            key: data.key,
            title: data.title,
            order: data.order,
        },
        select: {
            id: true,
        },
    });

    revalidatePath(
        `/medical-record/health-promotion/templates/${templateId}/versions/${versionId}`
    );

    return {
        ok: true as const,
        message: "La section a été créée avec succès.",
        id: created.id,
    };
}