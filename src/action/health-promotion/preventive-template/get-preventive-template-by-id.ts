"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";

export async function getPreventiveTemplateById(id: string) {
    const tenantId = await requireTenantId();

    const row = await prisma.preventiveTemplate.findFirst({
        where: {
            id,
            tenantId,
        },
        include: {
            serviceType: {
                select: {
                    id: true,
                    code: true,
                },
            },
            specialty: {
                select: {
                    id: true,
                    code: true,
                },
            },
            publishedVersion: {
                select: {
                    id: true,
                    version: true,
                },
            },
            versions: {
                orderBy: {
                    version: "desc",
                },
                select: {
                    id: true,
                    version: true,
                    status: true,
                    publishedAt: true,
                    createdAt: true
                },
            },
        },
    });

    if (!row) return null;

    return {
        id: row.id,
        code: row.code,
        name: row.name,
        serviceTypeId: row.serviceTypeId ?? null,
        specialtyId: row.specialtyId ?? null,
        status: row.status,
        isActive: row.isActive,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        serviceTypeName: row.serviceType?.code ?? null,
        specialtyName: row.specialty?.code ?? null,
        publishedVersionId: row.publishedVersionId ?? null,
        publishedVersionNumber: row.publishedVersion?.version ?? null,
        versions: row.versions.map((version) => ({
            id: version.id,
            version: version.version,
            status: version.status,
            publishedAt: version.publishedAt,
            createdAt: version.createdAt,
            // updatedAt: version.updatedAt,
        })),
    };
}