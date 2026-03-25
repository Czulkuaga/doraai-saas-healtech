"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { BPRoleType } from "../../../generated/prisma/enums";
import type { ProfessionalDetails } from "@/lib/types/professionals/professionals.types";

export async function getProfessionalByIdAction(
    id: string
): Promise<ProfessionalDetails | null> {
    const tenantId = await requireTenantId();

    const item = await prisma.businessPartner.findFirst({
        where: {
            id,
            tenantId,
            roles: {
                some: {
                    tenantId,
                    role: BPRoleType.PROVIDER,
                },
            },
        },
        include: {
            roles: {
                select: { role: true },
                orderBy: { role: "asc" },
            },
        },
    });

    if (!item) return null;

    return {
        id: item.id,
        tenantId: item.tenantId,
        code: item.code,
        type: item.type,
        isActive: item.isActive,
        firstName: item.firstName,
        lastName: item.lastName,
        organizationName: item.organizationName,
        email: item.email,
        emailNormalized: item.emailNormalized,
        phone: item.phone,
        phoneNormalized: item.phoneNormalized,
        birthDate: item.birthDate,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        roles: item.roles.map((x) => x.role),
    };
}