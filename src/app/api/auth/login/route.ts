import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, resolveTenantIdFromRequest } from "@/lib/auth/session";

export const runtime = "nodejs";

export function getClientIp(req: NextRequest) {
    const cf = req.headers.get("cf-connecting-ip");
    if (cf) return cf.trim();

    const realIp = req.headers.get("x-real-ip");
    if (realIp) return realIp.trim();

    const fwd = req.headers.get("x-forwarded-for");
    if (fwd) {
        const first = fwd.split(",")[0]?.trim();
        if (first) return first;
    }

    return null;
}

function normalizeIp(ip: string | null) {
    if (!ip) return null;
    if (ip === "::1") return "127.0.0.1";
    if (ip.startsWith("::ffff:")) return ip.replace("::ffff:", "");
    return ip;
}

/**
 * Only allow internal relative paths:
 * - must start with "/"
 * - must NOT start with "//"
 * - must NOT include protocol
 */
function sanitizeNext(next: unknown): string | null {
    if (typeof next !== "string") return null;
    const v = next.trim();
    if (!v) return null;

    if (!v.startsWith("/")) return null;
    if (v.startsWith("//")) return null;

    // block obvious protocol injections like "/\https://..."
    if (v.toLowerCase().includes("http://") || v.toLowerCase().includes("https://")) return null;

    return v;
}

export async function POST(req: NextRequest) {
    const ip = normalizeIp(getClientIp(req));
    const userAgent = req.headers.get("user-agent") ?? null;
    const host = req.headers.get("host") ?? null;

    const body = await req.json().catch(() => null);
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    const remember = Boolean(body?.remember ?? false);

    // 👇 nuevo
    const safeNext = sanitizeNext(body?.next) ?? "/dashboard";

    // 1) Validación básica
    if (!email || !password) {
        await prisma.authEvent.create({
            data: {
                type: "LOGIN_FAILED",
                success: false,
                message: "Missing credentials",
                ip,
                userAgent,
                host,
                metadata: { emailProvided: !!email },
            },
            select: { id: true },
        });

        return NextResponse.json({ ok: false, message: "Missing credentials" }, { status: 400 });
    }

    // 2) Resolver tenant por host/subdominio (y status ACTIVE si tu resolve ya lo valida)
    const tenantId = await resolveTenantIdFromRequest(req);
    if (!tenantId) {
        await prisma.authEvent.create({
            data: {
                type: "LOGIN_FAILED",
                success: false,
                message: "Invalid tenant",
                ip,
                userAgent,
                host,
                metadata: { email },
            },
            select: { id: true },
        });

        return NextResponse.json({ ok: false, message: "Invalid tenant" }, { status: 400 });
    }

    // 3) Buscar usuario (OJO: tu schema usa emailNormalized)
    // Si ya normalizas en DB, mejor usar emailNormalized.
    const user = await prisma.user.findUnique({
        where: { emailNormalized: email },
        select: { id: true, passwordHash: true, isActive: true },
    });

    if (!user || !user.isActive) {
        await prisma.authEvent.create({
            data: {
                tenantId,
                type: "LOGIN_FAILED",
                success: false,
                message: "Invalid credentials",
                ip,
                userAgent,
                host,
                metadata: { email },
            },
            select: { id: true },
        });

        return NextResponse.json({ ok: false, message: "Invalid credentials" }, { status: 401 });
    }

    // 4) Verificar password
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
        await prisma.authEvent.create({
            data: {
                tenantId,
                userId: user.id,
                type: "LOGIN_FAILED",
                success: false,
                message: "Invalid credentials",
                ip,
                userAgent,
                host,
                metadata: { email },
            },
            select: { id: true },
        });

        return NextResponse.json({ ok: false, message: "Invalid credentials" }, { status: 401 });
    }

    // 5) Validar membership activo en ese tenant
    const membership = await prisma.tenantMembership.findUnique({
        where: { tenantId_userId: { tenantId, userId: user.id } },
        select: { isActive: true },
    });

    if (!membership?.isActive) {
        await prisma.authEvent.create({
            data: {
                tenantId,
                userId: user.id,
                type: "LOGIN_FAILED",
                success: false,
                message: "No access to tenant",
                ip,
                userAgent,
                host,
                metadata: { email },
            },
            select: { id: true },
        });

        return NextResponse.json({ ok: false, message: "No access to tenant" }, { status: 403 });
    }

    // 6) SINGLE SESSION: revocar sesiones activas previas (user+tenant)
    const revokeResult = await prisma.session.updateMany({
        where: {
            userId: user.id,
            tenantId,
            revokedAt: null,
            expiresAt: { gt: new Date() },
        },
        data: { revokedAt: new Date() },
    });

    if (revokeResult.count > 0) {
        await prisma.authEvent.create({
            data: {
                tenantId,
                userId: user.id,
                type: "SESSION_REVOKED",
                success: true,
                message: "Previous active session(s) revoked due to new login",
                ip,
                userAgent,
                host,
                metadata: { revokedCount: revokeResult.count },
            },
            select: { id: true },
        });
    }

    // 7) Crear nueva sesión + cookie host-only
    await createSession({
        userId: user.id,
        tenantId,
        remember,
        ip,
        userAgent,
    });

    // ✅ 8) redirect final: usa next seguro
    // Nota: si createSession() YA loguea LOGIN_SUCCESS, no dupliques aquí.
    return NextResponse.json({ ok: true, redirectTo: safeNext });
}