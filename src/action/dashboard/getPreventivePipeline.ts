"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";

export async function getPreventivePipeline() {
    const tenantId = await requireTenantId();

    const [open, completed, cancelled] = await Promise.all([
        prisma.preventiveCase.count({
            where: { tenantId, status: "OPEN" },
        }),
        prisma.preventiveCase.count({
            where: { tenantId, status: "COMPLETED" },
        }),
        prisma.preventiveCase.count({
            where: { tenantId, status: "CANCELLED" },
        }),
    ]);

    return {
        open,
        completed,
        cancelled,
    };
}