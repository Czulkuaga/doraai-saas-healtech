"use server";

import { requireTenantId } from "@/lib/auth/session";
import { verifyAndPersistSimplyBookTwoFactor } from "@/lib/integrations/simplybook/simplybook-connection.service";

import type { SimplyBookVerifyTwoFactorInput } from "@/lib/integrations/simplybook/simplybook.types";

export async function verifySimplyBookTwoFactorAction(
    input: SimplyBookVerifyTwoFactorInput
) {
    try {
        const tenantId = await requireTenantId();

        const result =
            await verifyAndPersistSimplyBookTwoFactor(
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
                    : "No se pudo validar el segundo factor.",
        };
    }
}