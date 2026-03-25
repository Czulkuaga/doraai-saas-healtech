"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { patientSchema } from "@/lib/zod/private/medical-record/patients/patient.schema";
import { normalizeEmail, normalizeNullableString } from "@/lib/types/business-partner/business-partner.normalizers";
import { getPhonePersistence } from "@/lib/phone/get-phone-persistence";
import { nextNumberRangeCode } from "@/lib/number-range";
import { BPRoleType, NumberRangeObject } from "../../../generated/prisma/client";
import type { PatientActionState } from "@/lib/types/patients/patients.types";

export async function createPatientAction(
    raw: unknown
): Promise<PatientActionState> {
    const tenantId = await requireTenantId();

    const parsed = patientSchema.safeParse(raw);

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
                    throw new Error("PATIENT_CODE_ALREADY_EXISTS");
                }
            }

            const finalCode =
                manualCode ??
                (await nextNumberRangeCode({
                    tenantId,
                    object: NumberRangeObject.BUSINESS_PARTNER,
                    defaultPrefix: "PT",
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
                    phone: phoneResult.phone,
                    phoneNormalized: phoneResult.phoneNormalized,
                    birthDate: data.birthDate ? new Date(data.birthDate) : null,
                },
            });

            await tx.businessPartnerRole.create({
                data: {
                    tenantId,
                    partnerId: bp.id,
                    role: BPRoleType.PATIENT,
                },
            });

            return bp;
        });

        revalidatePath("/medical-record/patients");

        return {
            ok: true,
            id: created.id,
            message: "Patient créé avec succès.",
        };
    } catch (error) {
        console.error("createPatientAction", error);

        if (error instanceof Error && error.message === "PATIENT_CODE_ALREADY_EXISTS") {
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
            message: "Impossible de créer le patient pour le moment.",
        };
    }
}