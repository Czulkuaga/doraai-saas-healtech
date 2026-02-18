import { LogoutButton } from "@/components";
import { getAuthContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const ctx = await getAuthContext();

  if (!ctx) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: ctx.userId },
    select: {
      name: true,
      email: true,
    },
  });

  const tenant = await prisma.tenant.findUnique({
    where: { id: ctx.tenantId },
    select: {
      name: true,
      slug: true,
    },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">
      <div className="max-w-4xl mx-auto space-y-8">

        <div>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.name}
            </h1>
            <LogoutButton />
          </div>
          <p className="text-slate-400 mt-2">
            You are logged into{" "}
            <span className="text-[#13ecda] font-semibold">
              {tenant?.name}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h2 className="text-sm font-semibold text-slate-400 mb-2">
              Account Information
            </h2>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Category:</strong> {ctx.category}</p>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h2 className="text-sm font-semibold text-slate-400 mb-2">
              Tenant Information
            </h2>
            <p><strong>Slug:</strong> {tenant?.slug}</p>
            <p><strong>Tenant ID:</strong> {ctx.tenantId}</p>
          </div>

        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-sm font-semibold text-slate-400 mb-4">
            Permissions
          </h2>

          {ctx.permissions.size === 0 ? (
            <p className="text-slate-500 text-sm">
              No explicit permissions (possibly SUPERADMIN).
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-2 text-sm text-slate-300">
              {[...ctx.permissions].map((p) => (
                <li key={p} className="bg-slate-800 px-3 py-2 rounded-md">
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}