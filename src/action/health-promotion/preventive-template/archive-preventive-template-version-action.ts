"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function archivePreventiveTemplateVersionAction(
    templateId: string,
    versionId: string
) {
    const tenantId = await requireTenantId();

    const version = await prisma.preventiveTemplateVersion.findFirst({
        where: {
            id: versionId,
            templateId,
            tenantId,
        },
        include: {
            template: {
                select: {
                    id: true,
                    publishedVersionId: true,
                },
            },
        },
    });

    if (!version) {
        return {
            ok: false as const,
            message: "Version introuvable.",
        };
    }

    if (version.template.publishedVersionId === versionId) {
        return {
            ok: false as const,
            message: "La version actuellement publiée ne peut pas être archivée directement.",
        };
    }

    await prisma.preventiveTemplateVersion.update({
        where: {
            id: versionId,
        },
        data: {
            status: "ARCHIVED",
        },
    });

    revalidatePath(`/medical-record/health-promotion/templates/${templateId}`);
    revalidatePath(
        `/medical-record/health-promotion/templates/${templateId}/versions/${versionId}`
    );

    return {
        ok: true as const,
        message: "La version a été archivée avec succès.",
    };
}