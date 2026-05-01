import Link from "next/link";
import { PreventiveCaseStatus } from "../../../../../generated/prisma/enums";

type Item = {
    id: string;
    code: string;
    status: PreventiveCaseStatus;
    openedAt: Date;
    templateName: string;
    providerName: string | null;
    answersCount: number;
};

type Props = {
    items: Item[];
};

function statusLabel(status: PreventiveCaseStatus) {
    switch (status) {
        case PreventiveCaseStatus.OPEN:
            return "Ouvert";
        case PreventiveCaseStatus.IN_PROGRESS:
            return "En cours";
        case PreventiveCaseStatus.COMPLETED:
            return "Complété";
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
        case PreventiveCaseStatus.IN_PROGRESS:
            return "bg-amber-200 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
        case PreventiveCaseStatus.COMPLETED:
            return "bg-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
        case PreventiveCaseStatus.CANCELLED:
            return "bg-rose-200 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300";
        default:
            return "";
    }
}

export function PatientPreventiveCasesCard({ items }: Props) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            {/* HEADER */}
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Cas préventifs
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Historique des évaluations préventives du patient.
                    </p>
                </div>

                <Link
                    href="/medical-record/health-promotion/cases/new"
                    className="inline-flex items-center justify-center rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
                >
                    Nouveau cas
                </Link>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-900">
                        <tr>
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase text-slate-500">
                                Code
                            </th>
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase text-slate-500">
                                Modèle
                            </th>
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase text-slate-500">
                                Professionnel
                            </th>
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase text-slate-500">
                                Statut
                            </th>
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase text-slate-500">
                                Réponses
                            </th>
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase text-slate-500">
                                Date
                            </th>
                            <th className="px-5 py-3 text-right text-xs font-medium uppercase text-slate-500">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                <td className="px-5 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                                    {item.code}
                                </td>

                                <td className="px-5 py-3 text-sm text-slate-700 dark:text-slate-300">
                                    {item.templateName}
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
                                    {item.answersCount}
                                </td>

                                <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-400">
                                    {new Intl.DateTimeFormat("fr-BE").format(item.openedAt)}
                                </td>

                                <td className="px-5 py-3 text-right space-x-2">
                                    <Link
                                        href={`/medical-record/health-promotion/cases/${item.id}`}
                                        className="inline-flex rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                        Voir
                                    </Link>

                                    <Link
                                        href={`/medical-record/health-promotion/cases/${item.id}/edit`}
                                        className="inline-flex rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
                                    >
                                        Modifier
                                    </Link>
                                </td>
                            </tr>
                        ))}

                        {items.length === 0 && (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                                >
                                    Aucun cas préventif enregistré pour ce patient.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}