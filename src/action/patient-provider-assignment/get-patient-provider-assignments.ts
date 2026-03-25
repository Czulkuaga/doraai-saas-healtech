"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { Prisma } from "../../../generated/prisma/client";
import {
    PatientProviderAssignmentFilters,
    PatientProviderAssignmentListItem,
} from "@/lib/types/patient-provider-assignment/patient-provider-assignment.types";

function parsePage(value: unknown, fallback: number) {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 1) return fallback;
    return Math.floor(n);
}

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

export async function getPatientProviderAssignments(
    query: PatientProviderAssignmentFilters
) {
    const tenantId = await requireTenantId();

    const page = parsePage(query.page, 1);
    const pageSize = Math.min(50, Math.max(10, parsePage(query.pageSize, 10)));
    const skip = (page - 1) * pageSize;
    const q = query.q?.trim();

    const where: Prisma.PatientProviderAssignmentWhereInput = {
        tenantId,
        ...(query.patientId ? { patientId: query.patientId } : {}),
        ...(query.providerProfileId
            ? { providerProfileId: query.providerProfileId }
            : {}),
        ...(query.assignmentType
            ? { assignmentType: query.assignmentType }
            : {}),
        ...(query.isActive === "true"
            ? { isActive: true }
            : query.isActive === "false"
                ? { isActive: false }
                : {}),
        ...(query.isPrimary === "true"
            ? { isPrimary: true }
            : query.isPrimary === "false"
                ? { isPrimary: false }
                : {}),
        ...(q
            ? {
                OR: [
                    {
                        patient: {
                            OR: [
                                { code: { contains: q, mode: "insensitive" } },
                                { firstName: { contains: q, mode: "insensitive" } },
                                { lastName: { contains: q, mode: "insensitive" } },
                                {
                                    organizationName: {
                                        contains: q,
                                        mode: "insensitive",
                                    },
                                },
                                { email: { contains: q, mode: "insensitive" } },
                                { phone: { contains: q, mode: "insensitive" } },
                                {
                                    phoneNormalized: {
                                        contains: q,
                                        mode: "insensitive",
                                    },
                                },
                            ],
                        },
                    },
                    {
                        providerProfile: {
                            partner: {
                                OR: [
                                    { code: { contains: q, mode: "insensitive" } },
                                    {
                                        firstName: {
                                            contains: q,
                                            mode: "insensitive",
                                        },
                                    },
                                    {
                                        lastName: {
                                            contains: q,
                                            mode: "insensitive",
                                        },
                                    },
                                    {
                                        organizationName: {
                                            contains: q,
                                            mode: "insensitive",
                                        },
                                    },
                                    {
                                        email: {
                                            contains: q,
                                            mode: "insensitive",
                                        },
                                    },
                                    {
                                        phone: {
                                            contains: q,
                                            mode: "insensitive",
                                        },
                                    },
                                ],
                            },
                        },
                    },
                ],
            }
            : {}),
    };

    const [rows, totalItems] = await prisma.$transaction([
        prisma.patientProviderAssignment.findMany({
            where,
            skip,
            take: pageSize,
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
        }),
        prisma.patientProviderAssignment.count({ where }),
    ]);

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

    return {
        items,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
        page,
        pageSize,
    };
}