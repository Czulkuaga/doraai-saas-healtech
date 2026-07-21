// src/components/private/medical-record/patients/patient-clinical-timeline.tsx

import Link from "next/link";
import { PreventiveCaseStatus } from "../../../../../generated/prisma/enums";

type TimelineItem = {
    id: string;
    code: string;
    title: string | null;
    status: PreventiveCaseStatus;

    pathologyName: string | null;
    providerName: string | null;

    openedAt: Date;
    completedAt: Date | null;
    cancelledAt?: Date | null;

    followUpsCount?: number;
    timelineEventsCount?: number;
};

type Props = {
    items: TimelineItem[];
};

function formatDate(value?: Date | null) {
    if (!value) return null;

    return new Intl.DateTimeFormat("fr-BE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date(value));
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

function statusClass(status: PreventiveCaseStatus) {
    switch (status) {
        case PreventiveCaseStatus.ACTIVE:
            return "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300";
        case PreventiveCaseStatus.ON_HOLD:
            return "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300";
        case PreventiveCaseStatus.COMPLETED:
            return "bg-blue-500/10 text-blue-700 ring-blue-500/20 dark:text-blue-300";
        case PreventiveCaseStatus.CANCELLED:
            return "bg-red-500/10 text-red-700 ring-red-500/20 dark:text-red-300";
        case PreventiveCaseStatus.OPEN:
        default:
            return "bg-cyan-500/10 text-cyan-700 ring-cyan-500/20 dark:text-cyan-300";
    }
}

function dotClass(status: PreventiveCaseStatus) {
    switch (status) {
        case PreventiveCaseStatus.ACTIVE:
            return "bg-emerald-500 text-white";
        case PreventiveCaseStatus.ON_HOLD:
            return "bg-amber-500 text-white";
        case PreventiveCaseStatus.COMPLETED:
            return "bg-blue-500 text-white";
        case PreventiveCaseStatus.CANCELLED:
            return "bg-red-500 text-white";
        case PreventiveCaseStatus.OPEN:
        default:
            return "bg-cyan-500 text-white";
    }
}

function getCaseLabel(item: TimelineItem) {
    return item.title || item.pathologyName || "Dossier préventif";
}

function getLifecycleLabel(item: TimelineItem) {
    const openedAt = formatDate(item.openedAt);
    const completedAt = formatDate(item.completedAt);
    const cancelledAt = formatDate(item.cancelledAt);

    if (item.status === PreventiveCaseStatus.COMPLETED && completedAt) {
        return `Ouvert le ${openedAt} · Terminé le ${completedAt}`;
    }

    if (item.status === PreventiveCaseStatus.CANCELLED && cancelledAt) {
        return `Ouvert le ${openedAt} · Annulé le ${cancelledAt}`;
    }

    return openedAt ? `Ouvert le ${openedAt}` : "Date non renseignée";
}

export function PatientClinicalTimeline({ items }: Props) {
    return (
        <aside className="min-w-0 space-y-4">
            <div className="min-w-0">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Parcours préventif
                </h3>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Derniers dossiers de prévention liés au patient.
                </p>
            </div>

            <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                {items.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
                        Aucun dossier préventif n’a encore été ouvert pour ce
                        patient.
                    </div>
                ) : (
                    <div className="relative min-w-0 space-y-4 pl-9">
                        <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-200 dark:bg-slate-800" />

                        {items.map((item, index) => {
                            const followUpsCount = item.followUpsCount ?? 0;
                            const eventsCount = item.timelineEventsCount ?? 0;

                            return (
                                <article
                                    key={item.id}
                                    className="relative min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-500/30 hover:bg-cyan-500/5 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-cyan-400/30 dark:hover:bg-cyan-400/5"
                                >
                                    <div
                                        className={`absolute -left-9 top-4 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-sm ${dotClass(
                                            item.status
                                        )}`}
                                    >
                                        {index + 1}
                                    </div>

                                    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <Link
                                                href={`/medical-record/suivi-cases/cases/${item.id}`}
                                                className="block wrap-break-word text-sm font-semibold leading-snug text-slate-900 hover:text-cyan-600 dark:text-slate-100 dark:hover:text-cyan-300"
                                            >
                                                {getCaseLabel(item)}
                                            </Link>

                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                {getLifecycleLabel(item)}
                                            </p>
                                        </div>

                                        <span
                                            className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ring-1 ${statusClass(
                                                item.status
                                            )}`}
                                        >
                                            {statusLabel(item.status)}
                                        </span>
                                    </div>

                                    <div className="mt-4 space-y-1 text-xs">
                                        <p className="wrap-break-word font-medium text-slate-700 dark:text-slate-300">
                                            {item.pathologyName ||
                                                "Pathologie non renseignée"}
                                        </p>

                                        <p className="wrap-break-word text-slate-500 dark:text-slate-400">
                                            Professionnel:{" "}
                                            <span className="font-medium text-slate-700 dark:text-slate-300">
                                                {item.providerName ||
                                                    "Sans professionnel"}
                                            </span>
                                        </p>

                                        <p className="wrap-break-word text-slate-500 dark:text-slate-400">
                                            Référence:{" "}
                                            <span className="font-medium text-slate-700 dark:text-slate-300">
                                                {item.code}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:ring-slate-800">
                                            {followUpsCount} suivi
                                            {followUpsCount > 1 ? "s" : ""}
                                        </span>

                                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:ring-slate-800">
                                            {eventsCount} événement
                                            {eventsCount > 1 ? "s" : ""}
                                        </span>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </aside>
    );
}