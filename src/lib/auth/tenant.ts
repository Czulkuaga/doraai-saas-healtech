// src/lib/auth/tenant.ts
import type { NextRequest } from "next/server";

const RESERVED_SUBDOMAINS = new Set(["www", "app"]);

function extractSubdomain(host: string): string | null {
  // host puede venir como: demo.localhost:3000 o demo.miapp.com
  const cleanHost = host.split(":")[0].toLowerCase(); // quita :3000

  const parts = cleanHost.split(".").filter(Boolean);
  if (parts.length < 2) return null;

  // Caso local: demo.localhost
  if (parts.length === 2 && parts[1] === "localhost") {
    const sub = parts[0];
    if (sub && !RESERVED_SUBDOMAINS.has(sub)) return sub;
    return null;
  }

  // Caso prod: slug.miapp.com (3 o más partes)
  if (parts.length >= 3) {
    const sub = parts[0];
    if (sub && !RESERVED_SUBDOMAINS.has(sub)) return sub;
  }

  return null;
}

export function resolveTenantSlugFromRequest(req: NextRequest): string | null {

  // 1) subdominio
  const host = req.headers.get("host") ?? "";
  const sub = extractSubdomain(host);
  if (sub) return sub;

  // 2) header opcional para dev/proxies
  const h = req.headers.get("x-tenant");
  if (h) return h;

  return null;
}
