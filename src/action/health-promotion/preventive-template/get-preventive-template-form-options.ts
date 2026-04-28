"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import type { PreventiveTemplateFormOption } from "@/lib/types/health-promotion/preventive-template/preventive-template.form.types";

export async function getPreventiveTemplateFormOptions() {
    const tenantId = await requireTenantId();

    const [serviceTypes, specialties] = await prisma.$transaction([
        prisma.serviceType.findMany({
            where: {
                tenantId,
                isActive: true,
            },
            orderBy: {
                code: "asc",
            },
            select: {
                id: true,
                code: true,
            },
        }),
        prisma.specialty.findMany({
            where: {
                tenantId,
                isActive: true,
            },
            orderBy: {
                code: "asc",
            },
            select: {
                id: true,
                code: true,
            },
        }),
    ]);

    return {
        serviceTypes: serviceTypes.map<PreventiveTemplateFormOption>((item) => ({
            value: item.id,
            label: item.code,
        })),
        specialties: specialties.map<PreventiveTemplateFormOption>((item) => ({
            value: item.id,
            label: item.code,
        })),
    };
}