import { notFound } from "next/navigation";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";

import {
  PreventiveCaseStatus,
  PreventiveFollowUpStatus,
  PreventiveTimelineEventType,
} from "../../../../../../../generated/prisma/enums";

function getPartnerName(partner: {
  firstName: string | null;
  lastName: string | null;
  organizationName: string | null;
}) {
  const fullName = [partner.firstName, partner.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || partner.organizationName || "—";
}

function formatDate(date?: Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-BE").format(date);
}

function formatDateTime(date?: Date | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("fr-BE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case PreventiveCaseStatus.ON_HOLD:
      return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case PreventiveCaseStatus.COMPLETED:
      return "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300";
    case PreventiveCaseStatus.CANCELLED:
      return "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300";
    case PreventiveCaseStatus.OPEN:
    default:
      return "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";
  }
}

function followUpStatusLabel(status: PreventiveFollowUpStatus) {
  switch (status) {
    case PreventiveFollowUpStatus.PLANNED:
      return "Planifié";
    case PreventiveFollowUpStatus.CONFIRMED:
      return "Confirmé";
    case PreventiveFollowUpStatus.IN_PROGRESS:
      return "En cours";
    case PreventiveFollowUpStatus.COMPLETED:
      return "Réalisé";
    case PreventiveFollowUpStatus.CANCELLED:
      return "Annulé";
    case PreventiveFollowUpStatus.MISSED:
      return "Manqué";
    default:
      return status;
  }
}

function timelineTypeLabel(type: PreventiveTimelineEventType) {
  switch (type) {
    case PreventiveTimelineEventType.CASE_CREATED:
      return "Dossier créé";
    case PreventiveTimelineEventType.CASE_UPDATED:
      return "Dossier mis à jour";
    case PreventiveTimelineEventType.CASE_COMPLETED:
      return "Dossier terminé";
    case PreventiveTimelineEventType.CASE_CANCELLED:
      return "Dossier annulé";
    case PreventiveTimelineEventType.FOLLOW_UP_CREATED:
      return "Suivi créé";
    case PreventiveTimelineEventType.FOLLOW_UP_UPDATED:
      return "Suivi mis à jour";
    case PreventiveTimelineEventType.FOLLOW_UP_COMPLETED:
      return "Suivi réalisé";
    case PreventiveTimelineEventType.FOLLOW_UP_CANCELLED:
      return "Suivi annulé";
    case PreventiveTimelineEventType.FOLLOW_UP_MISSED:
      return "Suivi manqué";
    case PreventiveTimelineEventType.NOTE_ADDED:
      return "Note ajoutée";
    default:
      return type;
  }
}

function frequencyLabel(value?: string | null) {
  switch (value) {
    case "NONE":
      return "Aucune";
    case "WEEKLY":
      return "Hebdomadaire";
    case "BIWEEKLY":
      return "Toutes les 2 semaines";
    case "MONTHLY":
      return "Mensuelle";
    case "QUARTERLY":
      return "Trimestrielle";
    case "SEMIANNUAL":
      return "Semestrielle";
    case "ANNUAL":
      return "Annuelle";
    case "CUSTOM":
      return "Personnalisée";
    default:
      return "—";
  }
}

function riskLabel(value?: string | null) {
  switch (value) {
    case "LOW":
      return "Faible";
    case "MEDIUM":
      return "Moyen";
    case "HIGH":
      return "Élevé";
    case "CRITICAL":
      return "Critique";
    default:
      return "—";
  }
}

function getCaseTitle(item: {
  title: string | null;
  pathology: { name: string } | null;
}) {
  return item.title || item.pathology?.name || "Dossier préventif";
}

export default async function PreventiveCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenantId = await requireTenantId();

  const preventiveCase = await prisma.preventiveCase.findFirst({
    where: {
      id,
      tenantId,
    },
    select: {
      id: true,
      code: true,
      title: true,
      status: true,
      riskLevel: true,
      followUpFrequency: true,
      followUpIntervalDays: true,
      openedAt: true,
      completedAt: true,
      cancelledAt: true,
      lastFollowUpAt: true,
      nextFollowUpAt: true,
      nextAutomaticFollowUpAt: true,
      notes: true,

      patient: {
        select: {
          id: true,
          code: true,
          firstName: true,
          lastName: true,
          organizationName: true,
          birthDate: true,
          phone: true,
          email: true,
        },
      },

      pathology: {
        select: {
          id: true,
          code: true,
          name: true,
          color: true,
        },
      },

      providerProfile: {
        select: {
          id: true,
          partner: {
            select: {
              firstName: true,
              lastName: true,
              organizationName: true,
            },
          },
        },
      },

      followUps: {
        orderBy: {
          scheduledFor: "desc",
        },
        select: {
          id: true,
          code: true,
          title: true,
          status: true,
          priority: true,
          channel: true,
          outcome: true,
          scheduledFor: true,
          performedAt: true,
          nextFollowUpAt: true,
          durationMinutes: true,
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
        },
      },

      timelineEvents: {
        orderBy: {
          occurredAt: "desc",
        },
        take: 20,
        select: {
          id: true,
          type: true,
          title: true,
          description: true,
          occurredAt: true,
        },
      },
    },
  });

  if (!preventiveCase) return notFound();

  const caseTitle = getCaseTitle(preventiveCase);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {caseTitle}
            </h1>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${statusColor(
                preventiveCase.status
              )}`}
            >
              {statusLabel(preventiveCase.status)}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Cas {preventiveCase.code}
            {preventiveCase.pathology
              ? ` · ${preventiveCase.pathology.name}`
              : " · Cas général"}
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Link
            href={`/medical-record/patients/${preventiveCase.patient.id}`}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Retour patient
          </Link>

          <Link
            href={`/medical-record/suivi-cases/cases/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-emerald-400 hover:to-cyan-400"
          >
            Modifier
          </Link>
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:grid-cols-4">
        <MetaItem label="Patient" value={getPartnerName(preventiveCase.patient)} />
        <MetaItem
          label="Professionnel"
          value={
            preventiveCase.providerProfile
              ? getPartnerName(preventiveCase.providerProfile.partner)
              : "—"
          }
        />
        <MetaItem label="Pathologie" value={preventiveCase.pathology?.name || "Cas général"} />
        <MetaItem label="Date d’ouverture" value={formatDate(preventiveCase.openedAt)} />
        <MetaItem label="Niveau de risque" value={riskLabel(preventiveCase.riskLevel)} />
        <MetaItem label="Fréquence" value={frequencyLabel(preventiveCase.followUpFrequency)} />
        <MetaItem label="Dernier suivi" value={formatDate(preventiveCase.lastFollowUpAt)} />
        <MetaItem
          label="Prochain contrôle"
          value={formatDate(
            preventiveCase.nextFollowUpAt ||
              preventiveCase.nextAutomaticFollowUpAt
          )}
        />
      </section>

      {preventiveCase.notes && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Notes
          </h2>

          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
            {preventiveCase.notes}
          </p>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Suivis préventifs
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Contrôles, révisions et interactions liés à ce dossier.
          </p>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <Th>Code</Th>
                <Th>Suivi</Th>
                <Th>Professionnel</Th>
                <Th>Statut</Th>
                <Th>Canal</Th>
                <Th>Date prévue</Th>
                <Th>Date réalisée</Th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {preventiveCase.followUps.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <Td className="font-medium text-slate-900 dark:text-slate-100">
                    {item.code}
                  </Td>
                  <Td>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      Priorité: {item.priority}
                    </p>
                  </Td>
                  <Td>
                    {item.providerProfile
                      ? getPartnerName(item.providerProfile.partner)
                      : "—"}
                  </Td>
                  <Td>{followUpStatusLabel(item.status)}</Td>
                  <Td>{item.channel}</Td>
                  <Td>{formatDateTime(item.scheduledFor)}</Td>
                  <Td>{formatDateTime(item.performedAt)}</Td>
                </tr>
              ))}

              {preventiveCase.followUps.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    Aucun suivi enregistré pour ce dossier.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Timeline du dossier
        </h2>

        <div className="mt-5 space-y-4">
          {preventiveCase.timelineEvents.map((event) => (
            <div key={event.id} className="flex gap-3">
              <div className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-500" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {event.title || timelineTypeLabel(event.type)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDateTime(event.occurredAt)}
                </p>
                {event.description && (
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          ))}

          {preventiveCase.timelineEvents.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Aucun événement enregistré pour ce dossier.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
        {value}
      </p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-slate-500">
      {children}
    </th>
  );
}

function Td({
  children,
  className = "text-slate-600 dark:text-slate-400",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-5 py-3 text-sm ${className}`}>{children}</td>;
}