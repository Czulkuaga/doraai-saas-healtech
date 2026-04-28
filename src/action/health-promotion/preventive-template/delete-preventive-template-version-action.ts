"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function deletePreventiveTemplateVersionAction(
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
                    publishedVersionId: true,
                },
            },
            _count: {
                select: {
                    cases: true,
                },
            },
        },
    });

    if (!version) {
        return { ok: false as const, message: "Version introuvable." };
    }

    if (version.template.publishedVersionId === versionId) {
        return {
            ok: false as const,
            message: "La version actuellement publiée ne peut pas être supprimée.",
        };
    }

    if (version.status !== "DRAFT") {
        return {
            ok: false as const,
            message: "Seules les versions brouillon peuvent être supprimées.",
        };
    }

    if (version._count.cases > 0) {
        return {
            ok: false as const,
            message: "Cette version est liée à des cas préventifs et ne peut pas être supprimée.",
        };
    }

    await prisma.preventiveTemplateVersion.delete({
        where: { id: versionId },
    });

    revalidatePath("/medical-record/health-promotion/templates");
    revalidatePath(`/medical-record/health-promotion/templates/${templateId}`);

    return {
        ok: true as const,
        message: "La version a été supprimée avec succès.",
    };
}