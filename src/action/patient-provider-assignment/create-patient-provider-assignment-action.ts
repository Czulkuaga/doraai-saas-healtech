"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import {
    PatientProviderAssignmentInput,
    patientProviderAssignmentSchema,
} from "@/lib/zod/private/patient-provider-assignment/patient-provider-assignment.schema";
import { BPRoleType } from "../../../generated/prisma/client";

export async function createPatientProviderAssignmentAction(
    input: PatientProviderAssignmentInput
) {
    const tenantId = await requireTenantId();

    const parsed = patientProviderAssignmentSchema.safeParse(input);

    if (!parsed.success) {
        return {
            ok: false as const,
            errors: parsed.error.flatten().fieldErrors,
            message: "Veuillez corriger les erreurs du formulaire.",
        };
    }

    const data = parsed.data;

    const patient = await prisma.businessPartner.findFirst({
        where: {
            id: data.patientId,
            tenantId,
            isActive: true,
            roles: {
                some: {
                    role: BPRoleType.PATIENT,
                },
            },
        },
        select: { id: true },
    });

    if (!patient) {
        return {
            ok: false as const,
            message: "Le patient sélectionné est introuvable ou inactif.",
        };
    }

    const provider = await prisma.providerProfile.findFirst({
        where: {
            id: data.providerProfileId,
            isActive: true,
            partner: {
                tenantId,
                isActive: true,
                roles: {
                    some: {
                        role: BPRoleType.PROVIDER,
                    },
                },
            },
        },
        select: { id: true },
    });

    if (!provider) {
        return {
            ok: false as const,
            message: "Le professionnel sélectionné est introuvable ou inactif.",
        };
    }

    const existing = await prisma.patientProviderAssignment.findFirst({
        where: {
            tenantId,
            patientId: data.patientId,
            providerProfileId: data.providerProfileId,
            assignmentType: data.assignmentType,
        },
        select: { id: true },
    });

    if (existing) {
        return {
            ok: false as const,
            message: "Cette affectation existe déjà pour ce patient.",
        };
    }

    await prisma.$transaction(async (tx) => {
        if (data.isPrimary && data.isActive) {
            await tx.patientProviderAssignment.updateMany({
                where: {
                    tenantId,
                    patientId: data.patientId,
                    isPrimary: true,
                    isActive: true,
                },
                data: {
                    isPrimary: false,
                },
            });
        }

        await tx.patientProviderAssignment.create({
            data: {
                tenantId,
                patientId: data.patientId,
                providerProfileId: data.providerProfileId,
                assignmentType: data.assignmentType,
                isPrimary: data.isPrimary,
                isActive: data.isActive,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                notes: data.notes ?? null,
            },
        });
    });

    revalidatePath("/organization/patient-assignments");

    return {
        ok: true as const,
        message: "Affectation créée avec succès.",
    };
}