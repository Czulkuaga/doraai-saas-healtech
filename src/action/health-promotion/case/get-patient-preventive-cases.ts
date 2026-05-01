"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";

function getPartnerName(partner: {
    firstName: string | null;
    lastName: string | null;
    organizationName: string | null;
}) {
    const fullName = [partner.firstName, partner.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

    return fullName || partner.organizationName || "—";
}

export async function getPatientPreventiveCasesAction(patientId: string) {
    const tenantId = await requireTenantId();

    const items = await prisma.preventiveCase.findMany({
        where: {
            tenantId,
            patientId,
        },
        orderBy: {
            openedAt: "desc",
        },
        select: {
            id: true,
            code: true,
            status: true,
            openedAt: true,
            completedAt: true,
            cancelledAt: true,
            templateVersion: {
                select: {
                    template: {
                        select: {
                            name: true,
                            code: true,
                        },
                    },
                },
            },
            providerProfile: {
                select: {
                    partner: {
                        select: {
                            firstName: true,
                            lastName: true,
                            organizationName: true,
                        },
                    },
                },
            },
            _count: {
                select: {
                    values: true,
                },
            },
        },
    });

    return items.map((item) => ({
        id: item.id,
        code: item.code,
        status: item.status,
        openedAt: item.openedAt,
        completedAt: item.completedAt,
        cancelledAt: item.cancelledAt,
        templateName: item.templateVersion.template.name,
        templateCode: item.templateVersion.template.code,
        providerName: item.providerProfile
            ? getPartnerName(item.providerProfile.partner)
            : null,
        answersCount: item._count.values,
    }));
}