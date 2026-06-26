import Link from "next/link";
import { PreventiveCaseStatus } from "../../../../../generated/prisma/enums";

type Item = {
  id: string;
  code: string;
  title: string | null;
  status: PreventiveCaseStatus;

  openedAt: Date;
  completedAt: Date | null;
  cancelledAt?: Date | null;

  pathologyName: string | null;
  pathologyCode?: string | null;

  providerName: string | null;

  riskLevel?: string | null;
  followUpFrequency?: string | null;
  lastFollowUpAt?: Date | null;
  nextFollowUpAt?: Date | null;
  nextAutomaticFollowUpAt?: Date | null;

  followUpsCount: number;
  timelineEventsCount?: number;
};

type Props = {
  items: Item[];
};

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
    case PreventiveCaseStatus.OPEN:
      return "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    case PreventiveCaseStatus.ACTIVE:
      return "bg-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
    case PreventiveCaseStatus.ON_HOLD:
      return "bg-amber-200 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
    case PreventiveCaseStatus.COMPLETED:
      return "bg-blue-200 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
    case PreventiveCaseStatus.CANCELLED:
      return "bg-rose-200 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300";
    default:
      return "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
}

function getCaseLabel(item: Item) {
  return item.title || item.pathologyName || "Dossier préventif";
}

function formatDate(date?: Date | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("fr-BE").format(date);
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

export function PatientPreventiveCasesCard({ items }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      {/* HEADER */}
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Dossiers préventifs
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Suivi clinique préventif, pathologies, contrôles et prochaines
            révisions.
          </p>
        </div>

        <Link
          href="/medical-record/suivi-cases/cases/new"
          className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-emerald-400 hover:to-cyan-400"
        >
          Nouveau dossier
        </Link>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-275 divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase text-slate-500">
                Code
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase text-slate-500">
                Dossier
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase text-slate-500">
                Pathologie
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase text-slate-500">
                Professionnel
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase text-slate-500">
                Statut
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase text-slate-500">
                Risque
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase text-slate-500">
                Suivis
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase text-slate-500">
                Prochain contrôle
              </th>
              <th className="px-5 py-3 text-right text-xs font-medium uppercase text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {items.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-900/50"
              >
                <td className="px-5 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                  {item.code}
                </td>

                <td className="px-5 py-3">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {getCaseLabel(item)}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Ouvert le {formatDate(item.openedAt)}
                  </p>
                </td>

                <td className="px-5 py-3 text-sm text-slate-700 dark:text-slate-300">
                  {item.pathologyName || "Cas général"}
                </td>

                <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-400">
                  {item.providerName || "—"}
                </td>

                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(
                      item.status
                    )}`}
                  >
                    {statusLabel(item.status)}
                  </span>
                </td>

                <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-400">
                  {riskLabel(item.riskLevel)}
                </td>

                <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-400">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {item.followUpsCount}
                  </div>
                  <div className="text-xs text-slate-500">
                    {frequencyLabel(item.followUpFrequency)}
                  </div>
                </td>

                <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-400">
                  {formatDate(
                    item.nextFollowUpAt || item.nextAutomaticFollowUpAt
                  )}
                </td>

                <td className="space-x-2 px-5 py-3 text-right">
                  <Link
                    href={`/medical-record/suivi-cases/cases/${item.id}`}
                    className="inline-flex rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Voir
                  </Link>

                  <Link
                    href={`/medical-record/suivi-cases/cases/${item.id}/edit`}
                    className="inline-flex rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
                  >
                    Modifier
                  </Link>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  Aucun dossier préventif enregistré pour ce patient.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}