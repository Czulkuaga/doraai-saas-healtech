"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { professionalSchema } from "@/lib/zod/private/medical-record/professionals/professional.schema";
import { normalizeEmail, normalizeNullableString, normalizePhone } from "@/lib/types/business-partner/business-partner.normalizers";
import { BPRoleType } from "../../../generated/prisma/enums";
import type { ProfessionalActionState } from "@/lib/types/professionals/professionals.types";

import { getPhonePersistence } from "@/lib/phone/get-phone-persistence";

export async function updateProfessionalAction(
    id: string,
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

    const exists = await prisma.businessPartner.findFirst({
        where: {
            id,
            tenantId,
            roles: {
                some: {
                    tenantId,
                    role: BPRoleType.PROVIDER,
                },
            },
        },
        select: { id: true },
    });

    if (!exists) {
        return {
            ok: false,
            message: "Professionnel introuvable.",
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
                    throw new Error("PROFESSIONAL_CODE_ALREADY_EXISTS");
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
                        role: BPRoleType.PROVIDER,
                    },
                },
                update: {},
                create: {
                    tenantId,
                    partnerId: id,
                    role: BPRoleType.PROVIDER,
                },
            });
        });

        revalidatePath("/medical-record/professionals");
        revalidatePath(`/medical-record/professionals/${id}`);
        revalidatePath(`/medical-record/professionals/${id}/edit`);

        return {
            ok: true,
            id,
            message: "Professionnel mis à jour avec succès.",
        };
    } catch (error) {
        console.error("updateProfessionalAction", error);

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
            message: "Impossible de mettre à jour le professionnel pour le moment.",
        };
    }
}