"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";

export async function getPreventiveFieldOptionById(
    templateId: string,
    versionId: string,
    sectionId: string,
    fieldId: string,
    optionId: string
) {
    const tenantId = await requireTenantId();

    const row = await prisma.preventiveFieldOption.findFirst({
        where: {
            id: optionId,
            tenantId,
            versionId,
            fieldId,
            field: {
                sectionId,
                version: {
                    templateId,
                },
            },
        },
        include: {
            field: {
                select: {
                    id: true,
                    label: true,
                    type: true,
                    sectionId: true,
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
                },
            },
        },
    });

    if (!row) return null;

    return {
        id: row.id,
        tenantId: row.tenantId,
        versionId: row.versionId,
        fieldId: row.fieldId,
        key: row.key,
        label: row.label,
        order: row.order,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        field: row.field,
    };
}