import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components";
import { Topbar } from "@/components";
import { Footer } from "@/components";
import { getAuthStatus } from "@/lib/auth/session";

function mapReason(r: "missing" | "invalid" | "revoked" | "expired") {
    switch (r) {
        case "revoked":
            return "session_revoked";
        case "expired":
            return "session_expired";
        default:
            return "not_authenticated";
    }
}

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
    const st = await getAuthStatus();

    if (!st.ok) redirect(`/login?reason=${mapReason(st.reason)}`);

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
        <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            <Sidebar
                clinic={{ name: tenant?.name ?? "Tenant", slug: tenant?.slug }}
                user={{ name: user?.name ?? "User", email: user?.email ?? "—" }}
            />

            <main className="flex-1 ml-64 flex flex-col">
                <Topbar />
                <div className="p-8">{children}</div>
                <Footer clinicName={tenant?.name ?? undefined} />
            </main>
        </div>
    );
}