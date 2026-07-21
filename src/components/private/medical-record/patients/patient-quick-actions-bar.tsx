// src/components/private/medical-record/patients/patient-quick-actions-bar.tsx

import Link from "next/link";

type Props = {
    patientId: string;
};

export function PatientQuickActionsBar({ patientId }: Props) {
    return (
        <div className="fixed inset-x-0 bottom-4 z-40 px-4 print:hidden">
            <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-2xl backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Link
                        href={`/medical-record/suivi-cases/cases/new?patientId=${patientId}`}
                        className="flex h-12 flex-1 items-center justify-center rounded-xl bg-linear-to-r from-emerald-500 to-cyan-500 px-4 text-center text-sm font-bold text-white transition hover:from-emerald-400 hover:to-cyan-400"
                    >
                        Nouveau cas préventif
                    </Link>

                    <button
                        type="button"
                        className="flex h-12 flex-1 items-center justify-center rounded-xl bg-cyan-500/10 px-4 text-center text-sm font-bold text-cyan-700 transition hover:bg-cyan-500/20 dark:text-cyan-300"
                    >
                        Ajouter évolution
                    </button>
                </div>
            </div>
        </div>
    );
}