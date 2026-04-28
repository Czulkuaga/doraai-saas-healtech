"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";

export async function getPreventiveTemplateSectionDetail(
    templateId: string,
    versionId: string,
    sectionId: string
) {
    const tenantId = await requireTenantId();

    const row = await prisma.preventiveTemplateSection.findFirst({
        where: {
            id: sectionId,
            tenantId,
            versionId,
            version: {
                templateId,
            },
        },
        include: {
            version: {
                select: {
                    id: true,
                    version: true,
                    status: true,
                    template: {
                        select: {
                            id: true,
                            code: true,
                            name: true,
                        },
                    },
                },
            },
            fields: {
                orderBy: {
                    order: "asc",
                },
                select: {
                    id: true,
                    key: true,
                    label: true,
                    type: true,
                    required: true,
                    order: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            options: true,
                        },
                    },
                },
            },
        },
    });

    if (!row) return null;

    return {
        id: row.id,
        tenantId: row.tenantId,
        versionId: row.versionId,
        key: row.key,
        title: row.title,
        order: row.order,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        version: {
            id: row.version.id,
            version: row.version.version,
            status: row.version.status,
            template: row.version.template,
        },
        fields: row.fields.map((field) => ({
            id: field.id,
            key: field.key,
            label: field.label,
            type: field.type,
            required: field.required,
            order: field.order,
            createdAt: field.createdAt,
            updatedAt: field.updatedAt,
            optionsCount: field._count.options,
        })),
    };
}