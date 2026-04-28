// src/action/health-promotion/preventive-template/get-preventive-template-field-detail.ts
"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";

export async function getPreventiveTemplateFieldDetail(
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
            version: { templateId },
        },
        include: {
            section: { select: { id: true, key: true, title: true } },
            version: {
                select: {
                    id: true,
                    version: true,
                    status: true,
                    template: { select: { id: true, code: true, name: true } },
                },
            },
            options: {
                orderBy: { order: "asc" },
                select: {
                    id: true,
                    key: true,
                    label: true,
                    order: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
            _count: { select: { values: true } },
        },
    });

    if (!row) return null;

    return {
        id: row.id,
        key: row.key,
        label: row.label,
        type: row.type,
        required: row.required,
        order: row.order,
        config: row.config ?? null,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        valuesCount: row._count.values,
        section: row.section,
        version: row.version,
        options: row.options,
    };
}