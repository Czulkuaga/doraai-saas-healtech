"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";

export async function getPreventiveTemplateVersionById(
    templateId: string,
    versionId: string
) {
    const tenantId = await requireTenantId();

    const row = await prisma.preventiveTemplateVersion.findFirst({
        where: {
            id: versionId,
            templateId,
            tenantId,
        },
        include: {
            template: {
                select: {
                    id: true,
                    code: true,
                    name: true,
                    status: true,
                    isActive: true,
                    publishedVersionId: true,
                },
            },
            sections: {
                orderBy: {
                    order: "asc",
                },
                select: {
                    id: true,
                    key: true,
                    title: true,
                    order: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            fields: true,
                        },
                    },
                },
            },
            _count: {
                select: {
                    sections: true,
                    cases: true,
                },
            },
        },
    });

    if (!row) return null;

    return {
        id: row.id,
        tenantId: row.tenantId,
        templateId: row.templateId,
        version: row.version,
        status: row.status,
        rules: row.rules ?? null,
        publishedAt: row.publishedAt,
        createdAt: row.createdAt,
        isCurrentlyPublished: row.template.publishedVersionId === row.id,
        template: {
            id: row.template.id,
            code: row.template.code,
            name: row.template.name,
            status: row.template.status,
            isActive: row.template.isActive,
            publishedVersionId: row.template.publishedVersionId,
        },
        sections: row.sections.map((section) => ({
            id: section.id,
            key: section.key,
            title: section.title,
            order: section.order,
            createdAt: section.createdAt,
            updatedAt: section.updatedAt,
            fieldsCount: section._count.fields,
        })),
        totalSections: row._count.sections,
        totalCases: row._count.cases,
    };
}