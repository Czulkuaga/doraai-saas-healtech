"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
// import { BPRoleType } from "../../../generated/prisma/enums";

export async function getRecentActivity() {
    const tenantId = await requireTenantId();

    const recentCases = await prisma.preventiveCase.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
            patient: {
                select: {
                    firstName: true,
                    lastName: true,
                    organizationName: true,
                },
            },
        },
    });

    const getName = (p: any) =>
        p.organizationName ||
        [p.firstName, p.lastName].filter(Boolean).join(" ") ||
        "Sans nom";

    return recentCases.map((c) => ({
        type: "case",
        title:
            c.status === "COMPLETED"
                ? "Dossier préventif complété"
                : "Nouveau dossier préventif",
        description: getName(c.patient),
        date: c.createdAt,
    }));
}