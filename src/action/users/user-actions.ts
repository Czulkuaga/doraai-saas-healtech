// src/app/(private)/users/actions.ts
"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { MembershipCategory } from "../../../generated/prisma/enums";

import { requireTenantId, requireUserId } from "@/lib/auth/session";
import {
    createUserSchema,
    updateUserSchema,
} from "@/lib/zod/private/organization/users/user-schema";
import { normalizePhoneToE164 } from "@/lib/phone/normalize-phone";
import type { UserActionState } from "./users-actions.types";

function normalizeEmail(email: string) {
    return email.trim().toLowerCase();
}

function mapMembershipCategory(category: string): MembershipCategory {
    return category as MembershipCategory;
}

function mapMembershipActive(status: string) {
    return status === "ACTIVE";
}

export async function createOrAttachTenantUserAction(
    input: unknown
): Promise<UserActionState> {
    const tenantId = await requireTenantId();
    await requireUserId();

    const parsed = createUserSchema.safeParse(input);

    if (!parsed.success) {
        const flat = parsed.error.flatten();

        return {
            ok: false,
            message: "Veuillez corriger les champs du formulaire.",
            fieldErrors: {
                firstName: flat.fieldErrors.firstName?.[0],
                lastName: flat.fieldErrors.lastName?.[0],
                email: flat.fieldErrors.email?.[0],
                phone: flat.fieldErrors.phone?.[0],
                category: flat.fieldErrors.category?.[0],
                isActive: flat.fieldErrors.isActive?.[0],
                membershipStatus: flat.fieldErrors.membershipStatus?.[0],
                password: flat.fieldErrors.password?.[0],
                confirmPassword: flat.fieldErrors.confirmPassword?.[0],
            },
        };
    }

    const {
        firstName,
        lastName,
        email,
        phone,
        category,
        isActive,
        membershipStatus,
        password,
    } = parsed.data;

    const safeFirstName = firstName.trim();
    const safeLastName = lastName.trim();
    const safeFullName = `${safeFirstName} ${safeLastName}`.trim();
    const safeEmail = email.trim();
    const emailNorm = normalizeEmail(safeEmail);
    const safePhone = phone.trim();

    const phoneParsed = normalizePhoneToE164(safePhone, "BE");
    if (!phoneParsed.ok) {
        return {
            ok: false,
            message: phoneParsed.message,
            fieldErrors: { phone: phoneParsed.message },
        };
    }

    const phoneOwner = await prisma.user.findFirst({
        where: { phoneNormalized: phoneParsed.e164 },
        select: { id: true, email: true },
    });

    if (phoneOwner) {
        return {
            ok: false,
            message: "Ce numéro de téléphone est déjà utilisé par un autre utilisateur.",
            fieldErrors: {
                phone: "Ce numéro de téléphone est déjà utilisé.",
            },
        };
    }

    const existingUser = await prisma.user.findUnique({
        where: { emailNormalized: emailNorm },
        select: { id: true },
    });

    if (existingUser) {
        const existingMembership = await prisma.tenantMembership.findUnique({
            where: {
                tenantId_userId: { tenantId, userId: existingUser.id },
            },
            select: { id: true },
        });

        if (existingMembership) {
            return {
                ok: false,
                message: "Cet utilisateur est déjà rattaché à cette organisation.",
                fieldErrors: {
                    email: "Cet utilisateur existe déjà dans cette organisation.",
                },
            };
        }
    }

    const passHash = await bcrypt.hash(password, 10);

    await prisma.$transaction(async (tx) => {
        const user = await tx.user.upsert({
            where: { emailNormalized: emailNorm },
            update: {
                email: safeEmail,
                emailNormalized: emailNorm,
                name: safeFullName,
                firstName: safeFirstName,
                lastName: safeLastName,
                isActive,
                phone: safePhone,
                phoneNormalized: phoneParsed.e164,
                passwordHash: passHash,
            },
            create: {
                email: safeEmail,
                emailNormalized: emailNorm,
                name: safeFullName,
                firstName: safeFirstName,
                lastName: safeLastName,
                isActive,
                passwordHash: passHash,
                phone: safePhone,
                phoneNormalized: phoneParsed.e164,
            },
            select: { id: true },
        });

        await tx.tenantMembership.upsert({
            where: { tenantId_userId: { tenantId, userId: user.id } },
            update: {
                category: mapMembershipCategory(category),
                isActive: mapMembershipActive(membershipStatus),
            },
            create: {
                tenantId,
                userId: user.id,
                category: mapMembershipCategory(category),
                isActive: mapMembershipActive(membershipStatus),
            },
        });
    });

    revalidatePath("/organization/users");

    return {
        ok: true,
        message: "L’utilisateur a été créé avec succès.",
    };
}

export async function updateTenantUserAndMembershipAction(
    input: unknown
): Promise<UserActionState> {
    const tenantId = await requireTenantId();
    await requireUserId();

    const parsed = updateUserSchema.safeParse(input);

    if (!parsed.success) {
        const flat = parsed.error.flatten();

        return {
            ok: false,
            message: "Veuillez corriger les champs du formulaire.",
            fieldErrors: {
                membershipId: flat.fieldErrors.membershipId?.[0],
                firstName: flat.fieldErrors.firstName?.[0],
                lastName: flat.fieldErrors.lastName?.[0],
                email: flat.fieldErrors.email?.[0],
                phone: flat.fieldErrors.phone?.[0],
                category: flat.fieldErrors.category?.[0],
                isActive: flat.fieldErrors.isActive?.[0],
                membershipStatus: flat.fieldErrors.membershipStatus?.[0],
                password: flat.fieldErrors.password?.[0],
                confirmPassword: flat.fieldErrors.confirmPassword?.[0],
            },
        };
    }

    const {
        membershipId,
        firstName,
        lastName,
        email,
        phone,
        category,
        isActive,
        membershipStatus,
        password,
    } = parsed.data;

    const safeFirstName = firstName.trim();
    const safeLastName = lastName.trim();
    const safeFullName = `${safeFirstName} ${safeLastName}`.trim();
    const safeEmail = email.trim();
    const emailNorm = normalizeEmail(safeEmail);
    const safePhone = phone.trim();
    const safePassword = password?.trim() ?? "";

    const membership = await prisma.tenantMembership.findFirst({
        where: { id: membershipId, tenantId },
        select: { id: true, userId: true },
    });

    if (!membership) {
        return {
            ok: false,
            message: "Utilisateur introuvable dans cette organisation.",
            fieldErrors: { membershipId: "Utilisateur introuvable." },
        };
    }

    const phoneParsed = normalizePhoneToE164(safePhone, "BE");
    if (!phoneParsed.ok) {
        return {
            ok: false,
            message: phoneParsed.message,
            fieldErrors: { phone: phoneParsed.message },
        };
    }

    const phoneOwner = await prisma.user.findFirst({
        where: {
            phoneNormalized: phoneParsed.e164,
            id: { not: membership.userId },
        },
        select: { id: true },
    });

    if (phoneOwner) {
        return {
            ok: false,
            message: "Ce numéro de téléphone est déjà utilisé par un autre utilisateur.",
            fieldErrors: { phone: "Ce numéro de téléphone est déjà utilisé." },
        };
    }

    const emailOwner = await prisma.user.findFirst({
        where: {
            emailNormalized: emailNorm,
            id: { not: membership.userId },
        },
        select: { id: true },
    });

    if (emailOwner) {
        return {
            ok: false,
            message: "Cette adresse e-mail est déjà utilisée par un autre utilisateur.",
            fieldErrors: { email: "Cette adresse e-mail est déjà utilisée." },
        };
    }

    await prisma.$transaction(async (tx) => {
        await tx.tenantMembership.update({
            where: { id: membershipId },
            data: {
                category: mapMembershipCategory(category),
                isActive: mapMembershipActive(membershipStatus),
            },
        });

        await tx.user.update({
            where: { id: membership.userId },
            data: {
                name: safeFullName,
                firstName: safeFirstName,
                lastName: safeLastName,
                email: safeEmail,
                emailNormalized: emailNorm,
                isActive,
                phone: safePhone,
                phoneNormalized: phoneParsed.e164,
                ...(safePassword
                    ? { passwordHash: await bcrypt.hash(safePassword, 10) }
                    : {}),
            },
        });
    });

    revalidatePath("/organization/users");

    return {
        ok: true,
        message: "L’utilisateur a été mis à jour avec succès.",
    };
}

export async function updateMembershipAction(input: {
    membershipId: string;
    category: MembershipCategory;
    isActive: boolean;
}) {
    const tenantId = await requireTenantId();
    await requireUserId();

    const { membershipId, category, isActive } = input;

    // 🔒 Verificar que el membership pertenece al tenant actual
    const membership = await prisma.tenantMembership.findFirst({
        where: {
            id: membershipId,
            tenantId,
        },
        select: { id: true },
    });

    if (!membership) {
        return {
            ok: false as const,
            message: "Membresía no encontrada en este tenant.",
        };
    }

    const row = await prisma.tenantMembership.update({
        where: { id: membershipId },
        data: {
            category,
            isActive,
        },
        select: {
            id: true,
            category: true,
            isActive: true,
            createdAt: true,
            user: {
                select: {
                    id: true,
                    email: true,
                    emailNormalized: true,
                    name: true,
                    phone: true,
                    phoneNormalized: true,
                    isActive: true,
                    createdAt: true,
                },
            },
        },
    });

    revalidatePath("/organization/users");

    return {
        ok: true as const,
        row,
    };
}

export async function toggleTenantUserMembershipStatusAction(input: {
    membershipId: string;
    isActive: boolean;
}): Promise<UserActionState> {
    const tenantId = await requireTenantId();
    const actorUserId = await requireUserId();

    const { membershipId, isActive } = input;

    const mine = await prisma.tenantMembership.findFirst({
        where: { tenantId, userId: actorUserId },
        select: { id: true },
    });

    if (mine?.id === membershipId) {
        return {
            ok: false,
            message: "Vous ne pouvez pas modifier le statut de votre propre accès.",
        };
    }

    const membership = await prisma.tenantMembership.findFirst({
        where: { id: membershipId, tenantId },
        select: { id: true },
    });

    if (!membership) {
        return {
            ok: false,
            message: "Utilisateur introuvable dans cette organisation.",
        };
    }

    await prisma.tenantMembership.update({
        where: { id: membershipId },
        data: { isActive },
    });

    revalidatePath("/organization/users");
    revalidatePath(`/organization/users/${membershipId}`);

    return {
        ok: true,
        message: isActive
            ? "L’utilisateur a été réactivé avec succès."
            : "L’utilisateur a été désactivé avec succès.",
    };
}

export async function removeTenantUserMembershipAction(
  membershipId: string
): Promise<UserActionState> {
  const tenantId = await requireTenantId();
  const actorUserId = await requireUserId();

  const mine = await prisma.tenantMembership.findFirst({
    where: { tenantId, userId: actorUserId },
    select: { id: true },
  });

  if (mine?.id === membershipId) {
    return {
      ok: false,
      message: "Vous ne pouvez pas retirer votre propre accès.",
    };
  }

  const membership = await prisma.tenantMembership.findFirst({
    where: { id: membershipId, tenantId },
    select: { id: true },
  });

  if (!membership) {
    return {
      ok: false,
      message: "Utilisateur introuvable dans cette organisation.",
    };
  }

  await prisma.tenantMembership.delete({
    where: { id: membershipId },
  });

  revalidatePath("/organization/users");

  return {
    ok: true,
    message: "L’accès de l’utilisateur a été retiré avec succès.",
  };
}