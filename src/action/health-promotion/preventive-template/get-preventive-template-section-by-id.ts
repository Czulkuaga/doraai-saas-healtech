"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";

export async function getPreventiveTemplateSectionById(
    templateId: string,
    versionId: string,
    sectionId: string
) {
    const tenantId = await requireTenantId();

    const row = await prisma.preventiveTemplateSection.findFirst({
        where: {
            id: sectionId,
            versionId,
            tenantId,
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
                            name: true,
                            code: true,
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
        fieldsCount: row._count.fields,
        version: {
            id: row.version.id,
            version: row.version.version,
            status: row.version.status,
            template: row.version.template,
        },
    };
}