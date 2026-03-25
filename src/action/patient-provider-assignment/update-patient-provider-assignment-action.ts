"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import {
    PatientProviderAssignmentInput,
    patientProviderAssignmentSchema,
} from "@/lib/zod/private/patient-provider-assignment/patient-provider-assignment.schema";
import { BPRoleType } from "../../../generated/prisma/client";

export async function updatePatientProviderAssignmentAction(
    id: string,
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

    const current = await prisma.patientProviderAssignment.findFirst({
        where: { id, tenantId },
        select: { id: true },
    });

    if (!current) {
        return {
            ok: false as const,
            message: "Affectation introuvable.",
        };
    }

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

    const duplicated = await prisma.patientProviderAssignment.findFirst({
        where: {
            tenantId,
            patientId: data.patientId,
            providerProfileId: data.providerProfileId,
            assignmentType: data.assignmentType,
            NOT: { id },
        },
        select: { id: true },
    });

    if (duplicated) {
        return {
            ok: false as const,
            message: "Une affectation identique existe déjà.",
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
                    NOT: { id },
                },
                data: {
                    isPrimary: false,
                },
            });
        }

        await tx.patientProviderAssignment.update({
            where: { id },
            data: {
                patientId: data.patientId,
                providerProfileId: data.providerProfileId,
                assignmentType: data.assignmentType,
                isPrimary: data.isPrimary && data.isActive,
                isActive: data.isActive,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                notes: data.notes ?? null,
            },
        });
    });

    revalidatePath("/organization/patient-assignments");
    revalidatePath(`/organization/patient-assignments/${id}/edit`);

    return {
        ok: true as const,
        message: "Affectation mise à jour avec succès.",
    };
}