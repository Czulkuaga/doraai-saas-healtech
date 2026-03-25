"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { normalizeEmail, normalizeNullableString, normalizePhone } from "@/lib/types/business-partner/business-partner.normalizers";
import { professionalSchema } from "@/lib/zod/private/medical-record/professionals/professional.schema";
import { nextNumberRangeCode } from "@/lib/number-range";
import { BPRoleType, NumberRangeObject } from "../../../generated/prisma/client";
import type { ProfessionalActionState } from "@/lib/types/professionals/professionals.types";

import { getPhonePersistence } from "@/lib/phone/get-phone-persistence";

export async function createProfessionalAction(
    raw: unknown
): Promise<ProfessionalActionState> {
    const tenantId = await requireTenantId();

    const parsed = professionalSchema.safeParse(raw);

    if (!parsed.success) {
        return {
            ok: false,
            message: "Veuillez corriger les champs du formulaire.",
            fieldErrors: parsed.error.flatten().fieldErrors,
        };
    }

    const data = parsed.data;

    const phoneResult = getPhonePersistence(data.phone, "BE");

    if (!phoneResult.ok) {
        return {
            ok: false,
            message: "Veuillez corriger les champs du formulaire.",
            fieldErrors: {
                phone: [phoneResult.message],
            },
        };
    }

    try {
        const created = await prisma.$transaction(async (tx) => {
            const manualCode = normalizeNullableString(data.code);

            if (manualCode) {
                const exists = await tx.businessPartner.findFirst({
                    where: { tenantId, code: manualCode },
                    select: { id: true },
                });

                if (exists) {
                    throw new Error("PROFESSIONAL_CODE_ALREADY_EXISTS");
                }
            }

            const finalCode =
                manualCode ??
                (await nextNumberRangeCode({
                    tenantId,
                    object: NumberRangeObject.BUSINESS_PARTNER,
                    defaultPrefix: "BP",
                    defaultPadding: 6,
                    defaultNextNo: 1,
                    tx,
                }));

            const bp = await tx.businessPartner.create({
                data: {
                    tenantId,
                    code: finalCode,
                    type: data.type,
                    isActive: data.isActive ?? true,
                    firstName: normalizeNullableString(data.firstName),
                    lastName: normalizeNullableString(data.lastName),
                    organizationName: normalizeNullableString(data.organizationName),
                    email: normalizeNullableString(data.email),
                    emailNormalized: normalizeEmail(data.email),
                    phone: normalizeNullableString(data.phone),
                    phoneNormalized: phoneResult.phoneNormalized,
                    birthDate: data.birthDate ? new Date(data.birthDate) : null,
                },
            });

            await tx.businessPartnerRole.create({
                data: {
                    tenantId,
                    partnerId: bp.id,
                    role: BPRoleType.PROVIDER,
                },
            });

            return bp;
        });

        revalidatePath("/medical-record/professionals");

        return {
            ok: true,
            id: created.id,
            message: "Professionnel créé avec succès.",
        };
    } catch (error) {
        console.error("createProfessionalAction", error);

        if (error instanceof Error && error.message === "PROFESSIONAL_CODE_ALREADY_EXISTS") {
            return {
                ok: false,
                message: "Le code existe déjà.",
                fieldErrors: {
                    code: ["Le code existe déjà pour cette organisation."],
                },
            };
        }

        return {
            ok: false,
            message: "Impossible de créer le professionnel pour le moment.",
        };
    }
}