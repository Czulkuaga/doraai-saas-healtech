import Link from "next/link";
import { FiArrowRight, FiPlus, FiStar, FiUserCheck } from "react-icons/fi";
import type { PatientProviderAssignmentListItem } from "@/lib/types/patient-provider-assignment/patient-provider-assignment.types";
import { PatientProviderAssignmentStatusBadge } from "@/components/private/patient-provider-assignment/patient-provider-assignment-status-badge";
import { PatientProviderAssignmentTypeBadge } from "@/components/private/patient-provider-assignment/patient-provider-assignment-type-badge";

function formatDate(value?: string | null) {
    if (!value) return "—";
    return new Intl.DateTimeFormat("fr-BE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date(value));
}

type Props = {
    patientId: string;
    items: PatientProviderAssignmentListItem[];
};

export function PatientAssignedProvidersCard({ patientId, items }: Props) {
    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500/15 to-cyan-500/15 text-cyan-600 dark:text-cyan-300">
                        <FiUserCheck className="h-5 w-5" />
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            Professionnels assignés
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Relations actives et historiques entre ce patient et les professionnels.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        {items.length} affectation{items.length > 1 ? "s" : ""}
                    </div>

                    <Link
                        href={`/organization/patient-assignments/new?patientId=${patientId}`}
                        className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-emerald-400 hover:to-cyan-400"
                    >
                        <FiPlus className="h-4 w-4" />
                        Nouvelle affectation
                    </Link>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900/40">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Aucun professionnel n’est actuellement assigné à ce patient.
                    </p>

                    <Link
                        href={`/organization/patient-assignments/new?patientId=${patientId}`}
                        className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                    >
                        <FiPlus className="h-4 w-4" />
                        Créer la première affectation
                    </Link>
                </div>
            ) : (
                <>
                    <div className="mt-6 space-y-3 md:hidden">
                        {items.map((item) => (
                            <article
                                key={item.id}
                                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40"
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        {item.provider.label}
                                    </p>

                                    <PatientProviderAssignmentStatusBadge isActive={item.isActive} />

                                    {item.isPrimary ? (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                                            <FiStar className="h-3 w-3" />
                                            Principal
                                        </span>
                                    ) : null}
                                </div>

                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    {item.provider.code}
                                </p>

                                <div className="mt-3">
                                    <PatientProviderAssignmentTypeBadge type={item.assignmentType} />
                                </div>

                                <div className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                                    <p>{item.provider.email || "—"}</p>
                                    <p>{item.provider.phone || "—"}</p>
                                </div>

                                <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                    <span>Début: {formatDate(item.startDate)}</span>
                                    <Link
                                        href={`/organization/patient-assignments/${item.id}`}
                                        className="inline-flex items-center gap-1 font-medium text-cyan-700 hover:underline dark:text-cyan-300"
                                    >
                                        Voir
                                        <FiArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="mt-6 hidden overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 md:block">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-900/70">
                                    <tr className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                        <th className="px-5 py-4">Professionnel</th>
                                        <th className="px-5 py-4">Type</th>
                                        <th className="px-5 py-4">Principal</th>
                                        <th className="px-5 py-4">Début</th>
                                        <th className="px-5 py-4">Fin</th>
                                        <th className="px-5 py-4">Statut</th>
                                        <th className="px-5 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {items.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-t border-slate-200 dark:border-slate-800"
                                        >
                                            <td className="px-5 py-4">
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                                                        {item.provider.label}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                                        {item.provider.code}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <PatientProviderAssignmentTypeBadge type={item.assignmentType} />
                                            </td>

                                            <td className="px-5 py-4">
                                                {item.isPrimary ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                                                        <FiStar className="h-3 w-3" />
                                                        Oui
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">—</span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                                                {formatDate(item.startDate)}
                                            </td>

                                            <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                                                {formatDate(item.endDate)}
                                            </td>

                                            <td className="px-5 py-4">
                                                <PatientProviderAssignmentStatusBadge isActive={item.isActive} />
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <Link
                                                    href={`/organization/patient-assignments/${item.id}`}
                                                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                                                >
                                                    Voir
                                                    <FiArrowRight className="h-4 w-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}