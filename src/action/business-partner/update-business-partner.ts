"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { businessPartnerSchema } from "@/lib/zod/private/organization/business-partner/business-partner.schema";
import type { BusinessPartnerActionState } from "@/lib/types/business-partner/business-partner.types";
import {
    normalizeEmail,
    normalizeNullableString,
    normalizePhone,
} from "@/lib/types/business-partner/business-partner.normalizers";

export async function updateBusinessPartnerAction(
    id: string,
    raw: unknown
): Promise<BusinessPartnerActionState> {
    const tenantId = await requireTenantId();

    const parsed = businessPartnerSchema.safeParse(raw);

    if (!parsed.success) {
        return {
            ok: false,
            message: "Veuillez corriger les champs du formulaire.",
            fieldErrors: parsed.error.flatten().fieldErrors,
        };
    }

    const exists = await prisma.businessPartner.findFirst({
        where: { id, tenantId },
        select: { id: true },
    });

    if (!exists) {
        return {
            ok: false,
            message: "Tiers introuvable.",
        };
    }

    const data = parsed.data;

    try {
        await prisma.$transaction(async (tx) => {
            await tx.businessPartner.update({
                where: { id },
                data: {
                    code: normalizeNullableString(data.code) ?? undefined,
                    type: data.type,
                    isActive: data.isActive ?? true,
                    firstName: normalizeNullableString(data.firstName),
                    lastName: normalizeNullableString(data.lastName),
                    organizationName: normalizeNullableString(data.organizationName),
                    email: normalizeNullableString(data.email),
                    emailNormalized: normalizeEmail(data.email),
                    phone: normalizeNullableString(data.phone),
                    phoneNormalized: normalizePhone(data.phone),
                    birthDate: data.birthDate ? new Date(data.birthDate) : null,
                },
            });

            await tx.businessPartnerRole.deleteMany({
                where: {
                    tenantId,
                    partnerId: id,
                },
            });

            if (data.roles.length > 0) {
                await tx.businessPartnerRole.createMany({
                    data: data.roles.map((role) => ({
                        tenantId,
                        partnerId: id,
                        role,
                    })),
                    skipDuplicates: true,
                });
            }
        });

        revalidatePath("/business-partner");
        revalidatePath(`/business-partner/${id}`);
        revalidatePath(`/business-partner/${id}/edit`);

        return {
            ok: true,
            id,
            message: "Tiers mis à jour avec succès.",
        };
    } catch (error) {
        console.error("updateBusinessPartnerAction", error);

        return {
            ok: false,
            message: "Impossible de mettre à jour le tiers pour le moment.",
        };
    }
}