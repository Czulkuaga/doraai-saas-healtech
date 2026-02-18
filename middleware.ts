// middleware.ts
import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "dora_session";

// Ajusta tus rutas protegidas
const PROTECTED_PREFIXES = ["/dashboard", "/app", "/t"]; // incluye /t/* si usas path-tenant
const PUBLIC_PREFIXES = ["/login", "/api/auth/login", "/api/auth/logout", "/api/auth/me", "/_next", "/favicon.ico"];

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const isPublic = PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
    if (isPublic) return NextResponse.next();

    const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
    if (!isProtected) return NextResponse.next();

    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api/health).*)"],
};