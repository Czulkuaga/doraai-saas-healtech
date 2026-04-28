"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

function fieldTypeSupportsOptions(type: unknown) {
    return ["SELECT", "SINGLE_SELECT", "MULTI_SELECT", "RADIO", "CHECKBOX_GROUP"].includes(
        String(type)
    );
}

function hasDuplicates(values: number[]) {
    return new Set(values).size !== values.length;
}

export async function publishPreventiveTemplateVersionAction(
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
                    isActive: true,
                },
            },
            sections: {
                orderBy: { order: "asc" },
                include: {
                    fields: {
                        orderBy: { order: "asc" },
                        include: {
                            _count: {
                                select: {
                                    options: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!version) {
        return { ok: false as const, message: "Version introuvable." };
    }

    if (!version.template.isActive) {
        return {
            ok: false as const,
            message: "Le modèle parent est inactif. Impossible de publier cette version.",
        };
    }

    if (version.status === "ARCHIVED") {
        return {
            ok: false as const,
            message: "Une version archivée ne peut pas être publiée.",
        };
    }

    if (version.sections.length === 0) {
        return {
            ok: false as const,
            message: "La version doit contenir au moins une section avant publication.",
        };
    }

    const sectionOrders = version.sections.map((section) => section.order);

    if (hasDuplicates(sectionOrders)) {
        return {
            ok: false as const,
            message: "Deux sections ne peuvent pas avoir le même ordre.",
        };
    }

    for (const section of version.sections) {
        if (section.fields.length === 0) {
            return {
                ok: false as const,
                message: `La section "${section.title}" doit contenir au moins un champ.`,
            };
        }

        const fieldOrders = section.fields.map((field) => field.order);

        if (hasDuplicates(fieldOrders)) {
            return {
                ok: false as const,
                message: `La section "${section.title}" contient des champs avec le même ordre.`,
            };
        }

        for (const field of section.fields) {
            if (fieldTypeSupportsOptions(field.type) && field._count.options === 0) {
                return {
                    ok: false as const,
                    message: `Le champ "${field.label}" doit contenir au moins une option.`,
                };
            }
        }
    }

    await prisma.$transaction(async (tx) => {
        await tx.preventiveTemplateVersion.updateMany({
            where: {
                tenantId,
                templateId,
                status: "PUBLISHED",
                NOT: { id: versionId },
            },
            data: {
                status: "ARCHIVED",
            },
        });

        await tx.preventiveTemplateVersion.update({
            where: { id: versionId },
            data: {
                status: "PUBLISHED",
                publishedAt: new Date(),
            },
        });

        await tx.preventiveTemplate.update({
            where: { id: templateId },
            data: {
                publishedVersionId: versionId,
                status: "PUBLISHED",
            },
        });
    });

    revalidatePath("/medical-record/health-promotion/templates");
    revalidatePath(`/medical-record/health-promotion/templates/${templateId}`);
    revalidatePath(
        `/medical-record/health-promotion/templates/${templateId}/versions/${versionId}`
    );

    return {
        ok: true as const,
        message: "La version a été publiée avec succès.",
    };
}