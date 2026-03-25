"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";

function getPartnerLabel(partner: {
    organizationName: string | null;
    firstName: string | null;
    lastName: string | null;
}) {
    return (
        partner.organizationName ||
        [partner.firstName, partner.lastName].filter(Boolean).join(" ") ||
        "Sans nom"
    );
}

export async function getPatientProviderAssignmentById(id: string) {
    const tenantId = await requireTenantId();

    const row = await prisma.patientProviderAssignment.findFirst({
        where: {
            id,
            tenantId,
        },
        include: {
            patient: true,
            providerProfile: {
                include: {
                    partner: true,
                },
            },
        },
    });

    if (!row) return null;

    return {
        id: row.id,
        tenantId: row.tenantId,
        patientId: row.patientId,
        providerProfileId: row.providerProfileId,
        assignmentType: row.assignmentType,
        isPrimary: row.isPrimary,
        isActive: row.isActive,
        startDate: row.startDate,
        endDate: row.endDate,
        notes: row.notes ?? null,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        patient: {
            id: row.patient.id,
            code: row.patient.code,
            label: getPartnerLabel(row.patient),
            email: row.patient.email,
            phone: row.patient.phone,
        },
        provider: {
            id: row.providerProfile.id,
            partnerId: row.providerProfile.partner.id,
            code: row.providerProfile.partner.code,
            label: getPartnerLabel(row.providerProfile.partner),
            email: row.providerProfile.partner.email,
            phone: row.providerProfile.partner.phone,
            licenseNumber: row.providerProfile.licenseNumber ?? null,
        },
    };
}