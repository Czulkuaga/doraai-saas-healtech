"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";

export async function getPreventiveTemplateFieldById(
    templateId: string,
    versionId: string,
    sectionId: string,
    fieldId: string
) {
    const tenantId = await requireTenantId();

    const row = await prisma.preventiveTemplateField.findFirst({
        where: {
            id: fieldId,
            tenantId,
            versionId,
            sectionId,
            version: {
                templateId,
            },
        },
        include: {
            section: {
                select: {
                    id: true,
                    key: true,
                    title: true,
                    order: true,
                },
            },
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
            _count: {
                select: {
                    options: true,
                    values: true,
                },
            },
        },
    });

    if (!row) return null;

    return {
        id: row.id,
        tenantId: row.tenantId,
        versionId: row.versionId,
        sectionId: row.sectionId,
        key: row.key,
        label: row.label,
        type: row.type,
        required: row.required,
        order: row.order,
        configText: row.config ? JSON.stringify(row.config, null, 2) : "",
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        optionsCount: row._count.options,
        valuesCount: row._count.values,
        section: row.section,
        version: {
            id: row.version.id,
            version: row.version.version,
            status: row.version.status,
            template: row.version.template,
        },
    };
}