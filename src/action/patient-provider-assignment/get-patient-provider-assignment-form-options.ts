"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { BPRoleType } from "../../../generated/prisma/client";

function getPartnerLabel(partner: {
    organizationName: string | null;
    firstName: string | null;
    lastName: string | null;
    code: string;
}) {
    const label =
        partner.organizationName ||
        [partner.firstName, partner.lastName].filter(Boolean).join(" ") ||
        partner.code;

    return `${label} (${partner.code})`;
}

export async function getPatientProviderAssignmentFormOptions() {
    const tenantId = await requireTenantId();

    const [patients, providers] = await prisma.$transaction([
        prisma.businessPartner.findMany({
            where: {
                tenantId,
                isActive: true,
                roles: {
                    some: {
                        role: BPRoleType.PATIENT,
                    },
                },
            },
            orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
            select: {
                id: true,
                code: true,
                firstName: true,
                lastName: true,
                organizationName: true,
            },
        }),
        prisma.providerProfile.findMany({
            where: {
                isActive: true,
                partner: {
                    tenantId,
                    isActive: true,
                    roles: {
                        some: {
                            role: BPRoleType.PROVIDER,
                        },
                    },
                },
            },
            orderBy: [{ partner: { firstName: "asc" } }, { partner: { lastName: "asc" } }],
            select: {
                id: true,
                licenseNumber: true,
                partner: {
                    select: {
                        id: true,
                        code: true,
                        firstName: true,
                        lastName: true,
                        organizationName: true,
                    },
                },
            },
        }),
    ]);

    return {
        patients: patients.map((item) => ({
            value: item.id,
            label: getPartnerLabel(item),
        })),
        providers: providers.map((item) => ({
            value: item.id,
            label: getPartnerLabel(item.partner),
            licenseNumber: item.licenseNumber ?? null,
        })),
    };
}