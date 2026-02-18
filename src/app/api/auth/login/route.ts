import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, resolveTenantIdFromRequest } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => null);
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    const remember = Boolean(body?.remember ?? false);

    if (!email || !password) {
        return NextResponse.json({ ok: false, message: "Missing credentials" }, { status: 400 });
    }

    const tenantId = await resolveTenantIdFromRequest(req);
    if (!tenantId) {
        return NextResponse.json({ ok: false, message: "Invalid tenant" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, passwordHash: true, isActive: true },
    });

    if (!user || !user.isActive) {
        return NextResponse.json({ ok: false, message: "Invalid credentials" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
        return NextResponse.json({ ok: false, message: "Invalid credentials" }, { status: 401 });
    }

    // membership check (permitimos SUPERADMIN/otros solo si existe membership activo)
    const membership = await prisma.tenantMembership.findUnique({
        where: { tenantId_userId: { tenantId, userId: user.id } },
        select: { isActive: true },
    });

    if (!membership?.isActive) {
        return NextResponse.json({ ok: false, message: "No access to tenant" }, { status: 403 });
    }

    await createSession({
        userId: user.id,
        tenantId,
        remember,
        ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        userAgent: req.headers.get("user-agent") ?? null,
    });

    return NextResponse.json({
        ok: true,
        redirectTo: "/dashboard",
    });
}
