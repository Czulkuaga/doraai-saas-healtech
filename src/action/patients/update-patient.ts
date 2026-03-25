"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { patientSchema } from "@/lib/zod/private/medical-record/patients/patient.schema";
import { normalizeEmail, normalizeNullableString } from "@/lib/types/business-partner/business-partner.normalizers";
import { getPhonePersistence } from "@/lib/phone/get-phone-persistence";
import { BPRoleType } from "../../../generated/prisma/enums";
import type { PatientActionState } from "@/lib/types/patients/patients.types";

export async function updatePatientAction(
    id: string,
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

    const exists = await prisma.businessPartner.findFirst({
        where: {
            id,
            tenantId,
            roles: {
                some: {
                    tenantId,
                    role: BPRoleType.PATIENT,
                },
            },
        },
        select: { id: true },
    });

    if (!exists) {
        return {
            ok: false,
            message: "Patient introuvable.",
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
        await prisma.$transaction(async (tx) => {
            const manualCode = normalizeNullableString(data.code);

            if (manualCode) {
                const duplicated = await tx.businessPartner.findFirst({
                    where: {
                        tenantId,
                        code: manualCode,
                        NOT: { id },
                    },
                    select: { id: true },
                });

                if (duplicated) {
                    throw new Error("PATIENT_CODE_ALREADY_EXISTS");
                }
            }

            await tx.businessPartner.update({
                where: { id },
                data: {
                    code: manualCode ?? undefined,
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

            await tx.businessPartnerRole.upsert({
                where: {
                    tenantId_partnerId_role: {
                        tenantId,
                        partnerId: id,
                        role: BPRoleType.PATIENT,
                    },
                },
                update: {},
                create: {
                    tenantId,
                    partnerId: id,
                    role: BPRoleType.PATIENT,
                },
            });
        });

        revalidatePath("/medical-record/patients");
        revalidatePath(`/medical-record/patients/${id}`);
        revalidatePath(`/medical-record/patients/${id}/edit`);

        return {
            ok: true,
            id,
            message: "Patient mis à jour avec succès.",
        };
    } catch (error) {
        console.error("updatePatientAction", error);

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
            message: "Impossible de mettre à jour le patient pour le moment.",
        };
    }
}