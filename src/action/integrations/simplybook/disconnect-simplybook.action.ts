"use server";

import { requireTenantId } from "@/lib/auth/session";
import { disconnectSimplyBook } from "@/lib/integrations/simplybook/simplybook-connection.service";

export async function disconnectSimplyBookAction() {
    try {
        const tenantId = await requireTenantId();

        await disconnectSimplyBook(tenantId);

        return {
            success: true as const,
        };
    } catch (error) {
        return {
            success: false as const,
            error:
                error instanceof Error
                    ? error.message
                    : "No se pudo desconectar SimplyBook.",
        };
    }
}