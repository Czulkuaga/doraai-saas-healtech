"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { BPRoleType } from "../../../generated/prisma/enums";
import { professionalFiltersSchema } from "@/lib/zod/private/medical-record/professionals/professional-filters.schema";
import type {
    ProfessionalFilters,
    ProfessionalListItem,
} from "@/lib/types/professionals/professionals.types";

export async function listProfessionalsAction(raw?: ProfessionalFilters): Promise<{
    items: ProfessionalListItem[];
    totalItems: number;
    totalPages: number;
    page: number;
    pageSize: number;
}> {
    const tenantId = await requireTenantId();
    const parsed = professionalFiltersSchema.parse(raw ?? {});

    const page = parsed.page;
    const pageSize = parsed.pageSize;
    const skip = (page - 1) * pageSize;

    const where = {
        tenantId,
        roles: {
            some: {
                tenantId,
                role: BPRoleType.PROVIDER,
            },
        },
        ...(parsed.type !== "ALL" ? { type: parsed.type } : {}),
        ...(parsed.status === "ACTIVE" ? { isActive: true } : {}),
        ...(parsed.status === "INACTIVE" ? { isActive: false } : {}),
        ...(parsed.q?.trim()
            ? {
                OR: [
                    { code: { contains: parsed.q.trim(), mode: "insensitive" as const } },
                    { firstName: { contains: parsed.q.trim(), mode: "insensitive" as const } },
                    { lastName: { contains: parsed.q.trim(), mode: "insensitive" as const } },
                    { organizationName: { contains: parsed.q.trim(), mode: "insensitive" as const } },
                    { email: { contains: parsed.q.trim(), mode: "insensitive" as const } },
                    { phone: { contains: parsed.q.trim(), mode: "insensitive" as const } },
                ],
            }
            : {}),
    };

    const orderBy =
        parsed.sort === "oldest"
            ? [{ createdAt: "asc" as const }]
            : parsed.sort === "code_asc"
                ? [{ code: "asc" as const }]
                : parsed.sort === "code_desc"
                    ? [{ code: "desc" as const }]
                    : parsed.sort === "name_asc"
                        ? [{ organizationName: "asc" as const }, { firstName: "asc" as const }]
                        : parsed.sort === "name_desc"
                            ? [{ organizationName: "desc" as const }, { firstName: "desc" as const }]
                            : [{ createdAt: "desc" as const }];

    const [totalItems, rows] = await Promise.all([
        prisma.businessPartner.count({ where }),
        prisma.businessPartner.findMany({
            where,
            orderBy,
            skip,
            take: pageSize,
            include: {
                roles: {
                    select: { role: true },
                    orderBy: { role: "asc" },
                },
            },
        }),
    ]);

    return {
        items: rows.map((row) => ({
            id: row.id,
            tenantId: row.tenantId,
            code: row.code,
            type: row.type,
            isActive: row.isActive,
            firstName: row.firstName,
            lastName: row.lastName,
            organizationName: row.organizationName,
            email: row.email,
            emailNormalized: row.emailNormalized,
            phone: row.phone,
            phoneNormalized: row.phoneNormalized,
            birthDate: row.birthDate,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        })),
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
        page,
        pageSize,
    };
}