import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => null);
    const query = String(body?.query ?? "").trim();
    const slugGuess = String(body?.slugGuess ?? "").trim().toLowerCase();

    if (!query) {
        return NextResponse.json({ ok: false, message: "Missing query" }, { status: 400 });
    }

    // 1) Si el usuario ya escribió slug, probamos directo
    if (slugGuess) {
        const t = await prisma.tenant.findUnique({
            where: { slug: slugGuess },
            select: { slug: true, name: true, status: true },
        });

        if (t?.status === "ACTIVE") return NextResponse.json({ ok: true, slug: t.slug, name: t.name });
    }

    // 2) Búsqueda “suave” por nombre (contains). Luego lo puedes mejorar con full-text.
    const candidates = await prisma.tenant.findMany({
        where: {
            status: "ACTIVE",
            name: { contains: query, mode: "insensitive" },
        },
        select: { slug: true, name: true },
        take: 8,
    });

    if (candidates.length === 0) {
        return NextResponse.json({ ok: false, message: "Clinic not found. Please check the name or workspace URL." }, { status: 404 });
    }

    if (candidates.length === 1) {
        return NextResponse.json({ ok: true, slug: candidates[0].slug, name: candidates[0].name });
    }

    return NextResponse.json({ ok: true, options: candidates });
}
