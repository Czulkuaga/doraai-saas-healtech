"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { BPRoleType } from "../../../generated/prisma/enums";
import type { PatientDetails } from "@/lib/types/patients/patients.types";

export async function getPatientByIdAction(
    id: string
): Promise<PatientDetails | null> {
    const tenantId = await requireTenantId();

    const item = await prisma.businessPartner.findFirst({
        where: {
            id,
            tenantId,
            roles: {
                some: {
                    tenantId,
                    role: BPRoleType.PATIENT,
                },
            },
        },
        include: {
            nationality: {
                select: {
                    code: true,
                    name: true,
                },
            },
            preferredLanguage: {
                select: {
                    code: true,
                    name: true,
                    language: true,
                    region: true,
                },
            },
            addresses: {
                select: {
                    id: true,
                    type: true,
                    isPrimary: true,
                    street: true,
                    houseNumber: true,
                    box: true,
                    postalCode: true,
                    city: true,
                    region: true,
                    countryCode: true,
                    rawAddress: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: [
                    {
                        isPrimary: "desc",
                    },
                    {
                        createdAt: "desc",
                    },
                ],
            },
            identities: {
                where: {
                    isActive: true,
                },
                select: {
                    id: true,
                    type: true,
                    nationalNumber: true,
                    nationalNumberNormalized: true,
                    cardNumber: true,
                    cardNumberNormalized: true,
                    issuingCountryCode: true,
                    nationalityCode: true,
                    validFrom: true,
                    expiresAt: true,
                    readAt: true,
                    source: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
            insuranceCoverages: {
                select: {
                    id: true,
                    status: true,
                    insurerCode: true,
                    insurerName: true,
                    mutualityCode: true,
                    mutualityName: true,
                    verifiedAt: true,
                    validFrom: true,
                    validUntil: true,
                    source: true,
                    externalReference: true,
                    alerts: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
            roles: {
                select: {
                    role: true,
                },
                orderBy: {
                    role: "asc",
                },
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
        gender: item.gender,
        nationalityCode: item.nationalityCode,
        preferredLanguageCode: item.preferredLanguageCode,
        deceasedAt: item.deceasedAt,

        nationality: item.nationality,
        preferredLanguage: item.preferredLanguage,

        addresses: item.addresses,
        identities: item.identities,
        insuranceCoverages: item.insuranceCoverages,

        createdAt: item.createdAt,
        updatedAt: item.updatedAt,

        roles: item.roles.map((x) => x.role),
    };
}