import { prisma } from "@/lib/prisma";

import type {
    MedicloudPatientForSimplyBook,
} from "./simplybook.types";

export async function getPatientForSimplyBook(
    tenantId: string,
    partnerId: string
): Promise<MedicloudPatientForSimplyBook> {
    const partner =
        await prisma.businessPartner.findFirst({
            where: {
                id: partnerId,
                tenantId,

                isActive: true,

                roles: {
                    some: {
                        tenantId,
                        role: "PATIENT",
                    },
                },
            },

            include: {
                identities: {
                    where: {
                        tenantId,
                        isActive: true,
                    },

                    orderBy: {
                        updatedAt: "desc",
                    },
                },

                addresses: {
                    where: {
                        tenantId,
                    },

                    orderBy: [
                        {
                            isPrimary: "desc",
                        },
                        {
                            updatedAt: "desc",
                        },
                    ],
                },
            },
        });

    if (!partner) {
        throw new Error(
            "Le patient est introuvable ou n'appartient pas à ce tenant."
        );
    }

    const identity =
        partner.identities[0] ?? null;

    const address =
        partner.addresses[0] ?? null;

    return {
        partnerId: partner.id,
        code: partner.code,

        firstName:
            partner.firstName ?? null,

        lastName:
            partner.lastName ?? null,

        email:
            partner.email ?? null,

        emailNormalized:
            partner.emailNormalized ?? null,

        phone:
            partner.phone ?? null,

        phoneNormalized:
            partner.phoneNormalized ?? null,

        birthDate:
            partner.birthDate ?? null,

        gender:
            partner.gender ?? null,

        nationalityCode:
            partner.nationalityCode ?? null,

        preferredLanguageCode:
            partner.preferredLanguageCode ?? null,

        identity: identity
            ? {
                id: identity.id,
                type: identity.type,

                nationalNumber:
                    identity.nationalNumber ??
                    null,

                nationalNumberNormalized:
                    identity.nationalNumberNormalized ??
                    null,

                cardNumber:
                    identity.cardNumber ?? null,

                cardNumberNormalized:
                    identity.cardNumberNormalized ??
                    null,

                nationalityCode:
                    identity.nationalityCode ??
                    null,

                issuingCountryCode:
                    identity.issuingCountryCode ??
                    null,
            }
            : null,

        address: address
            ? {
                id: address.id,

                street:
                    address.street ?? null,

                houseNumber:
                    address.houseNumber ?? null,

                box:
                    address.box ?? null,

                postalCode:
                    address.postalCode ?? null,

                city:
                    address.city ?? null,

                region:
                    address.region ?? null,

                countryCode:
                    address.countryCode ?? null,

                rawAddress:
                    address.rawAddress ?? null,
            }
            : null,
    };
}