"use server";

import {
    ExternalSystem,
} from "../../../../generated/prisma/enums";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";

export type SimplyBookPatientLinkResult =
    | {
        status: "NOT_LINKED";
        externalId: null;
        lastMatchedAt: null;
    }
    | {
        status:
        | "ACTIVE"
        | "NOT_FOUND"
        | "AMBIGUOUS"
        | "DISABLED";

        externalId: string | null;

        lastMatchedAt: string | null;
    };

export async function getSimplyBookPatientLinkAction(
    partnerId: string
) {
    try {
        const tenantId =
            await requireTenantId();

        const link =
            await prisma.externalCustomerLink.findUnique({
                where: {
                    tenantId_partnerId_system: {
                        tenantId,
                        partnerId,

                        system:
                            ExternalSystem.SIMPLYBOOK,
                    },
                },
                select: {
                    status: true,
                    externalId: true,
                    lastMatchedAt: true,
                },
            });

        if (!link) {
            return {
                success: true as const,

                link: {
                    status:
                        "NOT_LINKED" as const,

                    externalId: null,
                    lastMatchedAt: null,
                },
            };
        }

        return {
            success: true as const,

            link: {
                status: link.status,

                externalId:
                    link.externalId,

                lastMatchedAt:
                    link.lastMatchedAt
                        ?.toISOString() ??
                    null,
            },
        };
    } catch (error) {
        console.error(
            "[getSimplyBookPatientLinkAction]",
            error
        );

        return {
            success: false as const,

            error:
                error instanceof Error
                    ? error.message
                    : "Impossible de consulter le lien SimplyBook.",
        };
    }
}