import { prisma } from "@/lib/prisma";

import { getAuthStatusCached } from "@/lib/auth/auth-cache";

export default async function MySessionsPage() {
  const st = await getAuthStatusCached();
  if (!st.ok) return null;

  const sessions = await prisma.session.findMany({
    where: { userId: st.session.userId, tenantId: st.session.tenantId },
    orderBy: { createdAt: "desc" },
    take: 25,
    select: {
      id: true,
      createdAt: true,
      lastSeenAt: true,
      expiresAt: true,
      revokedAt: true,
      ip: true,
      userAgent: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Activité</h1>
        <p className="text-sm text-slate-700 dark:text-slate-400">
          Voici vos dernières sessions pour cette clinique (espace de travail).
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold dark:text-slate-400 border-b border-b-slate-200 dark:border-b-slate-800">
          <div className="col-span-3">Created</div>
          <div className="col-span-3">Last seen</div>
          <div className="col-span-3">Expires</div>
          <div className="col-span-3">Status</div>
        </div>

        {sessions.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-700 dark:text-slate-400">No sessions found.</div>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {sessions.map((s) => (
              <li key={s.id} className="px-4 py-4">
                <div className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-3 text-sm text-slate-700 dark:text-slate-200">
                    {new Date(s.createdAt).toLocaleString()}
                  </div>
                  <div className="col-span-3 text-sm text-slate-700 dark:text-slate-200">
                    {s.lastSeenAt ? new Date(s.lastSeenAt).toLocaleString() : "—"}
                  </div>
                  <div className="col-span-3 text-sm text-slate-700 dark:text-slate-200">
                    {new Date(s.expiresAt).toLocaleString()}
                  </div>

                  <div className="col-span-3">
                    <span
                      className={[
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold",
                        s.revokedAt ? "bg-slate-700 text-slate-300" : "bg-emerald-900/40 text-emerald-300",
                      ].join(" ")}
                    >
                      {s.revokedAt ? "Revoked" : "Active"}
                    </span>

                    <div className="mt-2 text-xs text-slate-700 dark:text-slate-400">
                      <div>IP: {s.ip ?? "—"}</div>
                      <div className="line-clamp-2">UA: {s.userAgent ?? "—"}</div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}