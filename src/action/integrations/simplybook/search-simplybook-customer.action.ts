"use server";

import {
    requireTenantId,
} from "@/lib/auth/session";

import {
    resolveSimplyBookPatient,
} from "@/lib/integrations/simplybook/simplybook-customer-sync.service";

export async function searchSimplyBookCustomerAction(
    partnerId: string
) {
    try {
        const tenantId =
            await requireTenantId();

        if (!partnerId) {
            throw new Error(
                "Le patient est obligatoire."
            );
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
            "[searchSimplyBookCustomerAction]",
            error
        );

        return {
            success: false as const,

            status: "ERROR" as const,

            error:
                error instanceof Error
                    ? error.message
                    : "Impossible de rechercher le patient dans SimplyBook.",
        };
    }
}