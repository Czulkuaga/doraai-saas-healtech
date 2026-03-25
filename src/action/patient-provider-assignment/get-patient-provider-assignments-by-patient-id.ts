"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import type { PatientProviderAssignmentListItem } from "@/lib/types/patient-provider-assignment/patient-provider-assignment.types";

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

export async function getPatientProviderAssignmentsByPatientId(patientId: string) {
    const tenantId = await requireTenantId();

    const rows = await prisma.patientProviderAssignment.findMany({
        where: {
            tenantId,
            patientId,
        },
        orderBy: [
            { isPrimary: "desc" },
            { isActive: "desc" },
            { createdAt: "desc" },
        ],
        include: {
            patient: true,
            providerProfile: {
                include: {
                    partner: true,
                },
            },
        },
    });

    const items: PatientProviderAssignmentListItem[] = rows.map((row) => ({
        id: row.id,
        tenantId: row.tenantId,
        patientId: row.patientId,
        providerProfileId: row.providerProfileId,
        assignmentType: row.assignmentType,
        isPrimary: row.isPrimary,
        isActive: row.isActive,
        startDate: row.startDate ? row.startDate.toISOString() : null,
        endDate: row.endDate ? row.endDate.toISOString() : null,
        notes: row.notes,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
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
    }));

    return items;
}