"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function deletePreventiveTemplateSectionAction(
    templateId: string,
    versionId: string,
    sectionId: string
) {
    const tenantId = await requireTenantId();

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
            title: true,
            version: {
                select: {
                    status: true,
                    _count: {
                        select: {
                            cases: true,
                        },
                    },
                },
            },
            _count: {
                select: {
                    fields: true,
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
            message: "Seules les versions brouillon peuvent être modifiées.",
        };
    }

    if (section.version._count.cases > 0) {
        return {
            ok: false as const,
            message: "Cette version est déjà liée à des cas préventifs. La section ne peut pas être supprimée.",
        };
    }

    if (section._count.fields > 0) {
        return {
            ok: false as const,
            message: "Cette section contient déjà des champs. Supprimez d’abord les champs avant de supprimer la section.",
        };
    }

    await prisma.preventiveTemplateSection.delete({
        where: {
            id: sectionId,
        },
    });

    revalidatePath(
        `/medical-record/health-promotion/templates/${templateId}/versions/${versionId}`
    );

    return {
        ok: true as const,
        message: "La section a été supprimée avec succès.",
    };
}