"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { Prisma } from "../../../../generated/prisma/client";

export async function createPreventiveTemplateVersionAction(templateId: string) {
    const tenantId = await requireTenantId();

    const template = await prisma.preventiveTemplate.findFirst({
        where: {
            id: templateId,
            tenantId,
        },
        select: {
            id: true,
        },
    });

    if (!template) {
        return {
            ok: false as const,
            message: "Modèle introuvable.",
        };
    }

    const lastVersion = await prisma.preventiveTemplateVersion.findFirst({
        where: {
            tenantId,
            templateId,
        },
        orderBy: {
            version: "desc",
        },
        select: {
            version: true,
        },
    });

    const nextVersionNumber = (lastVersion?.version ?? 0) + 1;

    const created = await prisma.preventiveTemplateVersion.create({
        data: {
            tenantId,
            templateId,
            version: nextVersionNumber,
            status: "DRAFT",
            rules: Prisma.JsonNull,
        },
        select: {
            id: true,
            version: true,
        },
    });

    revalidatePath("/medical-record/health-promotion/templates");
    revalidatePath(`/medical-record/health-promotion/templates/${templateId}`);

    return {
        ok: true as const,
        message: "Nouvelle version créée avec succès.",
        id: created.id,
        version: created.version,
    };
}