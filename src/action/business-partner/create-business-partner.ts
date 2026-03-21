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
// import { nextNumberRangeCode } from "@/lib/number-range";
// import { NumberRangeObject } from "../../../generated/prisma/enums";

export async function createBusinessPartnerAction(
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

    const data = parsed.data;

    try {
        const code = normalizeNullableString(data.code);
        // const code =
        //     normalizeNullableString(data.code) ??
        //     (await nextNumberRangeCode({
        //         tenantId,
        //         object: NumberRangeObject.BUSINESS_PARTNER,
        //         defaultPrefix: "BP",
        //         defaultPadding: 6,
        //     }));

        const created = await prisma.$transaction(async (tx) => {
            const bp = await tx.businessPartner.create({
                data: {
                    tenantId,
                    code: code ?? crypto.randomUUID().slice(0, 8).toUpperCase(),
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

            if (data.roles.length > 0) {
                await tx.businessPartnerRole.createMany({
                    data: data.roles.map((role) => ({
                        tenantId,
                        partnerId: bp.id,
                        role,
                    })),
                    skipDuplicates: true,
                });
            }

            return bp;
        });

        revalidatePath("/business-partner");

        return {
            ok: true,
            id: created.id,
            message: "Tiers créé avec succès.",
        };
    } catch (error) {
        console.error("createBusinessPartnerAction", error);

        return {
            ok: false,
            message: "Impossible de créer le tiers pour le moment.",
        };
    }
}