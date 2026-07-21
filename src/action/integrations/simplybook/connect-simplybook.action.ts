"use server";

import { requireTenantId } from "@/lib/auth/session";
import { connectAndPersistSimplyBook } from "@/lib/integrations/simplybook/simplybook-connection.service";

import type { SimplyBookConnectInput } from "@/lib/integrations/simplybook/simplybook.types";

export async function connectSimplyBookAction(
    input: SimplyBookConnectInput
) {
    try {
        const tenantId = await requireTenantId();

        const result =
            await connectAndPersistSimplyBook(
                tenantId,
                input
            );

        return {
            success: true as const,
            ...result,
        };
    } catch (error) {
        return {
            success: false as const,
            error:
                error instanceof Error
                    ? error.message
                    : "No se pudo conectar con SimplyBook.",
        };
    }
}