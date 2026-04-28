"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { Prisma } from "../../../../generated/prisma/client";
import type {
    PreventiveTemplateFilters,
    PreventiveTemplateListItem,
} from "@/lib/types/health-promotion/preventive-template/preventive-template.types";

function parsePage(value: unknown, fallback: number) {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 1) return fallback;
    return Math.floor(n);
}

export async function getPreventiveTemplates(
    query: PreventiveTemplateFilters
) {
    const tenantId = await requireTenantId();

    const page = parsePage(query.page, 1);
    const pageSize = Math.min(50, Math.max(10, parsePage(query.pageSize, 10)));
    const skip = (page - 1) * pageSize;
    const q = query.q?.trim();

    const where: Prisma.PreventiveTemplateWhereInput = {
        tenantId,
        ...(query.status ? { status: query.status } : {}),
        ...(query.isActive === "true"
            ? { isActive: true }
            : query.isActive === "false"
                ? { isActive: false }
                : {}),
        ...(q
            ? {
                OR: [
                    { code: { contains: q, mode: "insensitive" } },
                    { name: { contains: q, mode: "insensitive" } },
                    {
                        serviceType: {
                            code: { contains: q, mode: "insensitive" },
                        },
                    },
                    {
                        specialty: {
                            code: { contains: q, mode: "insensitive" },
                        },
                    },
                ],
            }
            : {}),
    };

    const [rows, totalItems] = await prisma.$transaction([
        prisma.preventiveTemplate.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
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
                _count: {
                    select: {
                        versions: true,
                    },
                },
            },
        }),
        prisma.preventiveTemplate.count({ where }),
    ]);

    const items: PreventiveTemplateListItem[] = rows.map((row) => ({
        id: row.id,
        code: row.code,
        name: row.name,
        status: row.status as PreventiveTemplateListItem["status"],
        isActive: row.isActive,

        serviceTypeId: row.serviceTypeId ?? null,
        specialtyId: row.specialtyId ?? null,

        serviceTypeName: row.serviceType?.code ?? null,
        specialtyName: row.specialty?.code ?? null,

        publishedVersionId: row.publishedVersionId ?? null,
        publishedVersionNumber: row.publishedVersion?.version ?? null,

        totalVersions: row._count.versions,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
    }));

    return {
        items,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
        page,
        pageSize,
    };
}