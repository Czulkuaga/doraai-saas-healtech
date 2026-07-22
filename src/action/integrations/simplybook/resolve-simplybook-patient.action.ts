"use server";

import { requireTenantId } from "@/lib/auth/session";

import {
    resolveSimplyBookPatient,
} from "@/lib/integrations/simplybook/simplybook-customer-sync.service";

export async function resolveSimplyBookPatientAction(
    partnerId: string
) {
    try {
        const tenantId =
            await requireTenantId();

        if (!partnerId?.trim()) {
            return {
                success: false as const,
                status: "ERROR" as const,
                error:
                    "L'identifiant du patient est obligatoire.",
            };
        }

        const result =
            await resolveSimplyBookPatient(
                tenantId,
                partnerId
            );

        return {
            success: true as const,
            ...result,
        };
    } catch (error) {
        console.error(
            "[resolveSimplyBookPatientAction]",
            error
        );

        return {
            success: false as const,
            status: "ERROR" as const,

            error:
                error instanceof Error
                    ? error.message
                    : "Impossible de rechercher le patient dans SimplyBook.me.",
        };
    }
}