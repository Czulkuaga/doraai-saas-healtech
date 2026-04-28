"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import {
    preventiveTemplateSchema,
    type PreventiveTemplateInput,
} from "@/lib/zod/private/health-promotion/preventive-template/preventive-template.schema";

export async function updatePreventiveTemplateAction(
    id: string,
    input: PreventiveTemplateInput
) {
    const tenantId = await requireTenantId();

    const parsed = preventiveTemplateSchema.safeParse(input);

    if (!parsed.success) {
        return {
            ok: false as const,
            errors: parsed.error.flatten().fieldErrors,
            message: "Veuillez corriger les erreurs du formulaire.",
        };
    }

    const data = parsed.data;

    const current = await prisma.preventiveTemplate.findFirst({
        where: {
            id,
            tenantId,
        },
        select: {
            id: true,
        },
    });

    if (!current) {
        return {
            ok: false as const,
            message: "Modèle introuvable.",
        };
    }

    const duplicated = await prisma.preventiveTemplate.findFirst({
        where: {
            tenantId,
            code: data.code,
            NOT: { id },
        },
        select: { id: true },
    });

    if (duplicated) {
        return {
            ok: false as const,
            message: "Un autre modèle utilise déjà ce code.",
        };
    }

    if (data.serviceTypeId) {
        const serviceType = await prisma.serviceType.findFirst({
            where: {
                id: data.serviceTypeId,
                tenantId,
                isActive: true,
            },
            select: { id: true },
        });

        if (!serviceType) {
            return {
                ok: false as const,
                message: "Le type de service sélectionné est introuvable ou inactif.",
            };
        }
    }

    if (data.specialtyId) {
        const specialty = await prisma.specialty.findFirst({
            where: {
                id: data.specialtyId,
                tenantId,
                isActive: true,
            },
            select: { id: true },
        });

        if (!specialty) {
            return {
                ok: false as const,
                message: "La spécialité sélectionnée est introuvable ou inactive.",
            };
        }
    }

    await prisma.preventiveTemplate.update({
        where: { id },
        data: {
            code: data.code,
            name: data.name,
            // description: data.description ?? null,
            serviceTypeId: data.serviceTypeId ?? null,
            specialtyId: data.specialtyId ?? null,
            status: data.status,
            isActive: data.isActive,
        },
    });

    revalidatePath("/medical-record/health-promotion/templates");
    revalidatePath(`/medical-record/health-promotion/templates/${id}`);
    revalidatePath(`/medical-record/health-promotion/templates/${id}/edit`);

    return {
        ok: true as const,
        message: "Le modèle a été mis à jour avec succès.",
    };
}