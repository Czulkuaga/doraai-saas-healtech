"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import {
    createPathologySchema,
    updatePathologySchema,
} from "@/lib/zod/private/medical-record/pathologies/pathology.schema";

const PATHOLOGIES_PATH = "/medical-record/pathologies";

export async function listPathologiesAction() {
    const tenantId = await requireTenantId();

    return prisma.pathology.findMany({
        where: { tenantId },
        orderBy: [{ isActive: "desc" }, { name: "asc" }],
        select: {
            id: true,
            tenantId: true,
            code: true,
            name: true,
            description: true,
            color: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

export async function createPathologyAction(raw: unknown) {
    const tenantId = await requireTenantId();
    const data = createPathologySchema.parse(raw);

    await prisma.pathology.create({
        data: {
            tenantId,
            code: data.code,
            name: data.name,
            description: data.description,
            color: data.color,
            isActive: data.isActive,
        },
    });

    revalidatePath(PATHOLOGIES_PATH);

    return { ok: true };
}

export async function updatePathologyAction(raw: unknown) {
    const tenantId = await requireTenantId();
    const data = updatePathologySchema.parse(raw);

    await prisma.pathology.update({
        where: {
            id: data.id,
            tenantId,
        },
        data: {
            code: data.code,
            name: data.name,
            description: data.description,
            color: data.color,
            isActive: data.isActive,
        },
    });

    revalidatePath(PATHOLOGIES_PATH);

    return { ok: true };
}

export async function deactivatePathologyAction(id: string) {
    const tenantId = await requireTenantId();

    await prisma.pathology.update({
        where: {
            id,
            tenantId,
        },
        data: {
            isActive: false,
        },
    });

    revalidatePath(PATHOLOGIES_PATH);

    return { ok: true };
}