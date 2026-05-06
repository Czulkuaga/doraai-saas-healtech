"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { BPRoleType } from "../../../generated/prisma/enums";

export async function getDashboardKpis() {
    const tenantId = await requireTenantId();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 🧍 Total pacientes
    const totalPatients = await prisma.businessPartner.count({
        where: {
            tenantId,
            isActive: true,
            roles: {
                some: { role: BPRoleType.PATIENT },
            },
        },
    });

    // 🧠 Pacientes con al menos 1 caso preventivo
    const patientsWithCases = await prisma.preventiveCase.findMany({
        where: { tenantId },
        select: { patientId: true },
        distinct: ["patientId"],
    });

    const coverage =
        totalPatients > 0
            ? (patientsWithCases.length / totalPatients) * 100
            : 0;

    // 📁 Casos este mes
    const casesThisMonth = await prisma.preventiveCase.count({
        where: {
            tenantId,
            createdAt: { gte: startOfMonth },
        },
    });

    // ⚠️ Casos abiertos (trabajo real)
    const openCases = await prisma.preventiveCase.count({
        where: {
            tenantId,
            status: "OPEN",
        },
    });

    return {
        totalPatients,
        coverage: Number(coverage.toFixed(1)),
        casesThisMonth,
        openCases,
    };
}