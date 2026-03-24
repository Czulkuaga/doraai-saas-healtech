"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { roleFormSchema } from "@/lib/zod/private/organization/roles/role.schema";

function normalizeRoleKey(value: string) {
    return value.trim().toLowerCase().replace(/\s+/g, "_");
}

function revalidateRolePaths(roleId?: string) {
    revalidatePath("/organization/roles");
    revalidatePath("/organization/roles/new");
    if (roleId) {
        revalidatePath(`/organization/roles/${roleId}`);
        revalidatePath(`/organization/roles/${roleId}/edit`);
    }
}

export async function createRoleAction(input: unknown) {
    const tenantId = await requireTenantId();

    const parsed = roleFormSchema.safeParse(input);

    if (!parsed.success) {
        return {
            ok: false as const,
            errors: parsed.error.flatten(),
            message: "Veuillez corriger les champs du formulaire.",
        };
    }

    const data = parsed.data;
    const normalizedKey = normalizeRoleKey(data.key);

    const existing = await prisma.role.findFirst({
        where: {
            tenantId,
            key: normalizedKey,
        },
        select: { id: true },
    });

    if (existing) {
        return {
            ok: false as const,
            message: "Cette clé est déjà utilisée pour ce tenant.",
        };
    }

    const role = await prisma.$transaction(async (tx) => {
        const created = await tx.role.create({
            data: {
                tenantId,
                name: data.name.trim(),
                key: normalizedKey,
                isActive: data.isActive,
                isSystem: false,
            },
        });

        if (data.permissionIds.length > 0) {
            await tx.rolePermission.createMany({
                data: data.permissionIds.map((permissionId) => ({
                    roleId: created.id,
                    permissionId,
                })),
                skipDuplicates: true,
            });
        }

        return created;
    });

    revalidateRolePaths(role.id);

    return {
        ok: true as const,
        id: role.id,
        message: "Le rôle a été créé avec succès.",
    };
}

export async function updateRoleAction(roleId: string, input: unknown) {
    const tenantId = await requireTenantId();

    const parsed = roleFormSchema.safeParse(input);

    if (!parsed.success) {
        return {
            ok: false as const,
            errors: parsed.error.flatten(),
            message: "Veuillez corriger les champs du formulaire.",
        };
    }

    const current = await prisma.role.findFirst({
        where: {
            id: roleId,
            tenantId,
        },
        select: {
            id: true,
            isSystem: true,
        },
    });

    if (!current) {
        return {
            ok: false as const,
            message: "Rôle introuvable.",
        };
    }

    const data = parsed.data;
    const normalizedKey = normalizeRoleKey(data.key);

    const duplicated = await prisma.role.findFirst({
        where: {
            tenantId,
            key: normalizedKey,
            id: { not: roleId },
        },
        select: { id: true },
    });

    if (duplicated) {
        return {
            ok: false as const,
            message: "Cette clé est déjà utilisée pour ce tenant.",
        };
    }

    await prisma.$transaction(async (tx) => {
        await tx.role.update({
            where: { id: roleId },
            data: {
                name: data.name.trim(),
                ...(current.isSystem ? {} : { key: normalizedKey }),
                isActive: data.isActive,
            },
        });

        await tx.rolePermission.deleteMany({
            where: { roleId },
        });

        if (data.permissionIds.length > 0) {
            await tx.rolePermission.createMany({
                data: data.permissionIds.map((permissionId) => ({
                    roleId,
                    permissionId,
                })),
                skipDuplicates: true,
            });
        }
    });

    revalidateRolePaths(roleId);

    return {
        ok: true as const,
        message: "Le rôle a été mis à jour avec succès.",
    };
}

export async function toggleRoleStatusAction(roleId: string, nextActive: boolean) {
    const tenantId = await requireTenantId();

    const role = await prisma.role.findFirst({
        where: {
            id: roleId,
            tenantId,
        },
        select: {
            id: true,
            isSystem: true,
            isActive: true,
        },
    });

    if (!role) {
        return {
            ok: false as const,
            message: "Rôle introuvable.",
        };
    }

    if (role.isSystem) {
        return {
            ok: false as const,
            message: "Vous ne pouvez pas désactiver un rôle système.",
        };
    }

    await prisma.role.update({
        where: { id: roleId },
        data: {
            isActive: nextActive,
        },
    });

    revalidateRolePaths(roleId);

    return {
        ok: true as const,
        message: nextActive
            ? "Le rôle a été activé avec succès."
            : "Le rôle a été désactivé avec succès.",
    };
}

export async function deleteRoleAction(roleId: string) {
    const tenantId = await requireTenantId();

    const role = await prisma.role.findFirst({
        where: {
            id: roleId,
            tenantId,
        },
        include: {
            members: {
                select: { id: true },
                take: 1,
            },
        },
    });

    if (!role) {
        return {
            ok: false as const,
            message: "Rôle introuvable.",
        };
    }

    if (role.isSystem) {
        return {
            ok: false as const,
            message: "Vous ne pouvez pas supprimer un rôle système.",
        };
    }

    if (role.members.length > 0) {
        return {
            ok: false as const,
            message: "Vous ne pouvez pas supprimer un rôle déjà attribué à un utilisateur.",
        };
    }

    await prisma.$transaction(async (tx) => {
        await tx.rolePermission.deleteMany({
            where: { roleId },
        });

        await tx.role.delete({
            where: { id: roleId },
        });
    });

    revalidateRolePaths(roleId);

    return {
        ok: true as const,
        message: "Le rôle a été supprimé avec succès.",
    };
}