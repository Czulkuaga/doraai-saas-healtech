// src/app/(private)/medical-record/health-promotion/cases/page.tsx

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { PreventiveCaseStatus } from "../../../../../generated/prisma/enums";

function getPartnerName(partner: {
  firstName: string | null;
  lastName: string | null;
  organizationName: string | null;
}) {
  const fullName = [partner.firstName, partner.lastName].filter(Boolean).join(" ").trim();
  return fullName || partner.organizationName || "—";
}

function formatDate(date?: Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-BE").format(date);
}

function statusLabel(status: PreventiveCaseStatus) {
  switch (status) {
    case PreventiveCaseStatus.OPEN:
      return "Ouvert";
    case PreventiveCaseStatus.ACTIVE:
      return "Actif";
    case PreventiveCaseStatus.ON_HOLD:
      return "En pause";
    case PreventiveCaseStatus.COMPLETED:
      return "Terminé";
    case PreventiveCaseStatus.CANCELLED:
      return "Annulé";
    default:
      return status;
  }
}

function statusColor(status: PreventiveCaseStatus) {
  switch (status) {
    case PreventiveCaseStatus.ACTIVE:
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case PreventiveCaseStatus.ON_HOLD:
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case PreventiveCaseStatus.COMPLETED:
      return "bg-blue-500/10 text-blue-700 dark:text-blue-300";
    case PreventiveCaseStatus.CANCELLED:
      return "bg-rose-500/10 text-rose-700 dark:text-rose-300";
    default:
      return "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
}

export default async function PreventiveCasesPage() {
  const tenantId = await requireTenantId();

  const items = await prisma.preventiveCase.findMany({
    where: { tenantId },
    orderBy: { openedAt: "desc" },
    select: {
      id: true,
      code: true,
      title: true,
      status: true,
      openedAt: true,
      riskLevel: true,
      nextFollowUpAt: true,
      nextAutomaticFollowUpAt: true,

      patient: {
        select: {
          firstName: true,
          lastName: true,
          organizationName: true,
        },
      },

      pathology: {
        select: {
          name: true,
          code: true,
        },
      },

      providerProfile: {
        select: {
          partner: {
            select: {
              firstName: true,
              lastName: true,
              organizationName: true,
            },
          },
        },
      },

      _count: {
        select: {
          followUps: true,
          timelineEvents: true,
        },
      },
    },
  });

  const activeCount = items.filter((item) => item.status === PreventiveCaseStatus.ACTIVE).length;
  const completedCount = items.filter((item) => item.status === PreventiveCaseStatus.COMPLETED).length;
  const onHoldCount = items.filter((item) => item.status === PreventiveCaseStatus.ON_HOLD).length;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              Promotion de la santé
            </div>

            <h1 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Dossiers préventifs
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Vue générale des dossiers préventifs, pathologies, patients, professionnels et suivis associés.
            </p>
          </div>

          <Link
            href="/medical-record/suivi-cases/cases/new"
            className="cursor-pointer inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-emerald-400 hover:to-cyan-400"
          >
            Nouveau dossier
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Stat label="Total dossiers" value={items.length} />
        <Stat label="Actifs" value={activeCount} />
        <Stat label="En pause" value={onHoldCount} />
        <Stat label="Terminés" value={completedCount} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Liste des dossiers
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Tous les dossiers préventifs créés dans le tenant actuel.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-275 divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <Th>Code</Th>
                <Th>Dossier</Th>
                <Th>Patient</Th>
                <Th>Pathologie</Th>
                <Th>Professionnel</Th>
                <Th>Statut</Th>
                <Th>Suivis</Th>
                <Th>Prochain contrôle</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <Td strong>{item.code}</Td>

                  <Td>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {item.title || item.pathology?.name || "Dossier préventif"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Ouvert le {formatDate(item.openedAt)}
                    </p>
                  </Td>

                  <Td>{getPartnerName(item.patient)}</Td>

                  <Td>{item.pathology?.name || "Cas général"}</Td>

                  <Td>
                    {item.providerProfile
                      ? getPartnerName(item.providerProfile.partner)
                      : "—"}
                  </Td>

                  <Td>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(item.status)}`}>
                      {statusLabel(item.status)}
                    </span>
                  </Td>

                  <Td>{item._count.followUps}</Td>

                  <Td>{formatDate(item.nextFollowUpAt || item.nextAutomaticFollowUpAt)}</Td>

                  <Td align="right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/medical-record/suivi-cases/cases/${item.id}`}
                        className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Voir
                      </Link>

                      <Link
                        href={`/medical-record/suivi-cases/cases/${item.id}/edit`}
                        className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
                      >
                        Modifier
                      </Link>
                    </div>
                  </Td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    Aucun dossier préventif enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </p>
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-5 py-3 text-${align} text-xs font-medium uppercase text-slate-500`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  strong = false,
  align = "left",
}: {
  children: React.ReactNode;
  strong?: boolean;
  align?: "left" | "right";
}) {
  return (
    <td
      className={`px-5 py-3 text-${align} text-sm ${
        strong
          ? "font-medium text-slate-900 dark:text-slate-100"
          : "text-slate-600 dark:text-slate-400"
      }`}
    >
      {children}
    </td>
  );
}