import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { revokeCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export function getClientIp(req: NextRequest) {
    // Cloudflare
    const cf = req.headers.get("cf-connecting-ip");
    if (cf) return cf.trim();

    // Otros proxies
    const realIp = req.headers.get("x-real-ip");
    if (realIp) return realIp.trim();

    // Vercel / estándar
    const fwd = req.headers.get("x-forwarded-for");
    if (fwd) {
        // puede venir lista "ip1, ip2, ip3"
        const first = fwd.split(",")[0]?.trim();
        if (first) return first;
    }

    // fallback dev
    return null;
}

function normalizeIp(ip: string | null) {
    if (!ip) return null;
    if (ip === "::1") return "127.0.0.1";
    // IPv6 mapped IPv4: ::ffff:192.168.0.10
    if (ip.startsWith("::ffff:")) return ip.replace("::ffff:", "");
    return ip;
}

export async function POST(req: NextRequest) {
    const ip = normalizeIp(getClientIp(req));
    const userAgent = req.headers.get("user-agent") ?? null;
    const host = req.headers.get("host") ?? null;

    // Intentamos obtener contexto mínimo desde la cookie antes de revocar (si existe)
    // (sin depender de getAuthContext para evitar costo extra)
    const token = req.cookies.get(process.env.AUTH_COOKIE_NAME ?? "dora_session")?.value;

    let tenantId: string | null = null;
    let userId: string | null = null;

    if (token) {
        // Importante: usa la misma función tokenHash que ya tienes
        const { tokenHashFromRawToken } = await import("@/lib/auth/token-hash");
        const tokenHash = tokenHashFromRawToken(token);

        const s = await prisma.session.findUnique({
            where: { tokenHash },
            select: { tenantId: true, userId: true, revokedAt: true },
        });

        tenantId = s?.tenantId ?? null;
        userId = s?.userId ?? null;
    }

    // Revoca sesión + borra cookie (idempotente)
    await revokeCurrentSession();

    // Log logout (aunque no exista sesión, lo dejamos como intento)
    await prisma.authEvent.create({
        data: {
            tenantId,
            userId,
            type: "LOGOUT",
            success: true,
            message: token ? "Logout" : "Logout without active session",
            ip,
            userAgent,
            host,
        },
        select: { id: true },
    });

    return NextResponse.json({ ok: true, redirectTo: "/login" });
}
