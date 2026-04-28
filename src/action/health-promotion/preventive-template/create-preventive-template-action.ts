"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import {
    preventiveTemplateSchema,
    type PreventiveTemplateInput,
} from "@/lib/zod/private/health-promotion/preventive-template/preventive-template.schema";
import { Prisma } from "../../../../generated/prisma/client";

export async function createPreventiveTemplateAction(
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

    const existing = await prisma.preventiveTemplate.findFirst({
        where: {
            tenantId,
            code: data.code,
        },
        select: { id: true },
    });

    if (existing) {
        return {
            ok: false as const,
            message: "Un modèle avec ce code existe déjà.",
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

    const created = await prisma.$transaction(async (tx) => {
        const template = await tx.preventiveTemplate.create({
            data: {
                tenantId,
                code: data.code,
                name: data.name,
                // description: data.description ?? null,
                serviceTypeId: data.serviceTypeId ?? null,
                specialtyId: data.specialtyId ?? null,
                status: data.status,
                isActive: data.isActive,
            },
            select: {
                id: true,
            },
        });

        const version = await tx.preventiveTemplateVersion.create({
            data: {
                tenantId,
                templateId: template.id,
                version: 1,
                status: "DRAFT",
                rules: Prisma.JsonNull,
            },
            select: {
                id: true,
            },
        });

        return {
            templateId: template.id,
            versionId: version.id,
        };
    });

    revalidatePath("/medical-record/health-promotion/templates");

    return {
        ok: true as const,
        message: "Le modèle a été créé avec succès.",
        id: created.templateId,
        versionId: created.versionId,
    };
}