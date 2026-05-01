// src/components/private/medical-record/patients/patient-clinical-timeline.tsx

import Link from "next/link";
import { PreventiveCaseStatus } from "../../../../../generated/prisma/enums";

type TimelineItem = {
    id: string;
    code: string;
    status: PreventiveCaseStatus;
    templateName: string;
    providerName: string | null;
    openedAt: Date;
    completedAt: Date | null;
};

type Props = {
    items: TimelineItem[];
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

export function PatientClinicalTimeline({ items }: Props) {
    return (
        <aside className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Timeline clinique
            </h3>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                {items.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Aucun événement clinique pour le moment.
                    </p>
                ) : (
                    <div className="grid grid-cols-[32px_1fr] gap-x-3">
                        {items.map((item, index) => (
                            <div key={item.id} className="contents">
                                <div className="flex flex-col items-center">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/10 text-sm font-bold text-cyan-700 dark:text-cyan-300">
                                        {index + 1}
                                    </div>

                                    {index < items.length - 1 && (
                                        <div className="h-14 w-px bg-slate-200 dark:bg-slate-800" />
                                    )}
                                </div>

                                <div className="pb-6">
                                    <Link
                                        href={`/medical-record/health-promotion/cases/${item.id}`}
                                        className="text-sm font-semibold text-slate-900 hover:text-cyan-600 dark:text-slate-100 dark:hover:text-cyan-300"
                                    >
                                        {item.templateName}
                                    </Link>

                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                        {new Intl.DateTimeFormat("fr-BE").format(item.openedAt)}
                                        {" · "}
                                        {item.providerName || "Sans professionnel"}
                                    </p>

                                    <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                                        {item.code} · {statusLabel(item.status)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
}