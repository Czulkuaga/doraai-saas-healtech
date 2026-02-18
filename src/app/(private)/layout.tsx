import { redirect } from "next/navigation";
import { getAuthStatusCached } from "@/lib/auth/auth-cache";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/auth/LogoutButton";
import Link from "next/link";

function mapReason(r: "missing" | "invalid" | "revoked" | "expired") {
    switch (r) {
        case "revoked":
            return "session_revoked";
        case "expired":
            return "session_expired";
        case "missing":
        case "invalid":
        default:
            return "not_authenticated";
    }
}

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
    const st = await getAuthStatusCached();

    if (!st.ok) {
        redirect(`/login?reason=${mapReason(st.reason)}`);
    }

    const session = st.session;

    const [user, tenant] = await Promise.all([
        prisma.user.findUnique({
            where: { id: session.userId },
            select: { name: true, email: true },
        }),
        prisma.tenant.findUnique({
            where: { id: session.tenantId },
            select: { name: true, slug: true },
        }),
    ]);

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
                <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
                    <div>
                        <div className="text-sm font-semibold text-slate-200">{tenant?.name ?? "Tenant"}</div>
                        <div className="text-xs text-slate-400">{tenant?.slug}</div>
                    </div>

                    <div className="mx-auto max-w-6xl flex items-center justify-center">

                        <nav className="flex flex-wrap gap-2">
                            <Link
                                href="/dashboard"
                                className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                            >
                                Dashboard
                            </Link>

                            <Link
                                href="/profile/sessions"
                                className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                            >
                                My Sessions
                            </Link>

                            <Link
                                href="/settings/sessions"
                                className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                            >
                                Tenant Sessions (SuperAdmin)
                            </Link>
                        </nav>

                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-sm font-semibold">{user?.name ?? "User"}</div>
                            <div className="text-xs text-slate-400">{user?.email}</div>
                        </div>
                        <LogoutButton />
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        </div>
    );
}
