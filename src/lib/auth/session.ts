// src/lib/auth/session.ts
import "server-only";
import crypto from "crypto";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { resolveTenantSlugFromRequest } from "./tenant";
import type { NextRequest } from "next/server";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "dora_session";
const PEPPER = process.env.AUTH_TOKEN_PEPPER ?? "dev-pepper";
const SESSION_DAYS = Number(process.env.AUTH_SESSION_DAYS ?? "1");
const REMEMBER_DAYS = Number(process.env.AUTH_REMEMBER_DAYS ?? "30");

function sha256(input: string) {
    return crypto.createHash("sha256").update(input).digest("hex");
}

function tokenHash(token: string) {
    return sha256(`${token}.${PEPPER}`);
}

function newToken() {
    return crypto.randomBytes(48).toString("base64url");
}

export type AuthContext = {
    userId: string;
    tenantId: string;
    membershipId: string | null;
    category: "SUPERADMIN" | "ADMIN" | "USER" | "PROFESSIONAL" | null;
    permissions: Set<string>;
};

export async function getAuthStatus() {
    const jar = await cookies();
    const token = jar.get(COOKIE_NAME)?.value;
    if (!token) return { ok: false as const, reason: "missing" as const };

    const hash = tokenHash(token);
    const session = await prisma.session.findUnique({ where: { tokenHash: hash } });

    if (!session) return { ok: false as const, reason: "invalid" as const };
    if (session.revokedAt) return { ok: false as const, reason: "revoked" as const };
    if (session.expiresAt.getTime() <= Date.now()) return { ok: false as const, reason: "expired" as const };

    return { ok: true as const, session };
}

export async function createSession(params: {
    userId: string;
    tenantId: string;
    remember: boolean;
    ip?: string | null;
    userAgent?: string | null;
}) {
    const token = newToken();
    const hash = tokenHash(token);

    const days = params.remember ? REMEMBER_DAYS : SESSION_DAYS;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await prisma.session.create({
        data: {
            userId: params.userId,
            tenantId: params.tenantId,
            tokenHash: hash,
            expiresAt,
            ip: params.ip ?? null,
            userAgent: params.userAgent ?? null,
            lastSeenAt: new Date(),
        },
        select: { id: true },
    });

    // cookie httpOnly
    const jar = await cookies();
    jar.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: expiresAt, // persistente
    });

    return { expiresAt };
}

export async function revokeCurrentSession() {
    const jar = await cookies();
    const token = jar.get(COOKIE_NAME)?.value;

    if (!token) return;

    const hash = tokenHash(token);

    await prisma.session.updateMany({
        where: {
            tokenHash: hash,
            revokedAt: null,
        },
        data: {
            revokedAt: new Date(),
        },
    });

    jar.delete(COOKIE_NAME);
}

export async function getAuthContext(req?: NextRequest): Promise<AuthContext | null> {
    const jar = await cookies();
    const token = jar.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const hash = tokenHash(token);

    // 1) Session válida
    const session = await prisma.session.findUnique({
        where: { tokenHash: hash },
        select: {
            userId: true,
            tenantId: true,
            expiresAt: true,
            revokedAt: true,
            lastSeenAt: true,
        },
    });

    if (!session) return null;
    if (session.revokedAt) return null;
    if (session.expiresAt.getTime() <= Date.now()) {
        // marcar como revocada por expiración (opcional pero recomendado)
        const upd = await prisma.session.updateMany({
            where: { tokenHash: hash, revokedAt: null },
            data: { revokedAt: new Date() },
        });

        if (upd.count > 0) {
            // registrar evento
            await prisma.authEvent.create({
                data: {
                    tenantId: session.tenantId,
                    userId: session.userId,
                    type: "SESSION_EXPIRED",
                    success: true,
                    message: "Session expired",
                    metadata: { expiresAt: session.expiresAt },
                },
                select: { id: true },
            });

            return null;
        }
    }

    // 2) Validate tentat
    // 🔐 VALIDAR TENANT VS HOST
    const h = await headers();
    const host = h.get("host") ?? "";
    const sub = host.split(".")[0];

    const tenant = await prisma.tenant.findUnique({
        where: { id: session.tenantId },
        select: { slug: true },
    });

    if (!tenant) return null;

    if (sub !== tenant.slug) {
        // alguien intentó usar cookie en otro subdominio
        return null;
    }

    // 2) lastSeen + refresh window
    const now = Date.now();
    const TEN_MIN = 10 * 60 * 1000;
    const SIX_HOURS = 6 * 60 * 60 * 1000;

    // refresh window: si expira pronto, extiende 1 día (o lo que uses)
    const extendMs = 24 * 60 * 60 * 1000;

    const shouldTouchLastSeen =
        !session.lastSeenAt || (now - session.lastSeenAt.getTime() > TEN_MIN);

    const expiresSoon =
        (session.expiresAt.getTime() - now) < SIX_HOURS;

    if (shouldTouchLastSeen || expiresSoon) {
        await prisma.session.update({
            where: { tokenHash: hash },
            data: {
                lastSeenAt: new Date(),
                ...(expiresSoon ? { expiresAt: new Date(now + extendMs) } : {}),
            },
            select: { id: true },
        });
    }

    // 3) Membership + category
    const membership = await prisma.tenantMembership.findUnique({
        where: { tenantId_userId: { tenantId: session.tenantId, userId: session.userId } },
        select: { id: true, category: true, isActive: true },
    });

    if (!membership?.isActive) {
        // sesión existe pero ya no tiene acceso al tenant
        return {
            userId: session.userId,
            tenantId: session.tenantId,
            membershipId: null,
            category: null,
            permissions: new Set(),
        };
    }

    // 4) Permisos por roles (RBAC)
    const rolePerms = await prisma.membershipRole.findMany({
        where: { membershipId: membership.id },
        select: {
            role: {
                select: {
                    permissions: { select: { permission: { select: { key: true } } } },
                },
            },
        },
    });

    const permissions = new Set<string>();
    for (const mr of rolePerms) {
        for (const rp of mr.role.permissions) permissions.add(rp.permission.key);
    }

    return {
        userId: session.userId,
        tenantId: session.tenantId,
        membershipId: membership.id,
        category: membership.category,
        permissions,
    };
}

// Útil para login: resuelve tenant por slug
export async function resolveTenantIdFromRequest(req: NextRequest) {
    const slug = resolveTenantSlugFromRequest(req);

    if (!slug) return null;

    const tenant = await prisma.tenant.findUnique({
        where: { slug },
        select: { id: true, slug: true, status: true },
    });

    if (!tenant || tenant.status !== "ACTIVE") return null;
    return tenant.id;
}