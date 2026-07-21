"use server";

import { requireTenantId } from "@/lib/auth/session";
import { getSimplyBookConnectionSummary } from "@/lib/integrations/simplybook/simplybook-connection.service";

export async function getSimplyBookConnectionAction() {
    try {
        const tenantId = await requireTenantId();

        const connection =
            await getSimplyBookConnectionSummary(tenantId);

        return {
            success: true as const,
            connection,
        };
    } catch (error) {
        return {
            success: false as const,
            error:
                error instanceof Error
                    ? error.message
                    : "No se pudo consultar la conexión.",
        };
    }
}