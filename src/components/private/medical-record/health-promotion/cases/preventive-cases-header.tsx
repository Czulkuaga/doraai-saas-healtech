// preventive-cases-header.tsx

import Link from "next/link";

export function PreventiveCasesHeader() {
    return (
        <section className="w-full flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
            <div className="w-1/2 p-2">
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Cas préventifs
                </h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Gérez les évaluations préventives des patients.
                </p>
            </div>

            <div className="w-1/2 flex items-center justify-start sm:justify-end p-2">
                <Link
                    href="/medical-record/health-promotion/cases/new"
                    className="cursor-pointer inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-emerald-400 hover:to-cyan-400"
                >
                    Nouveau cas
                </Link>
            </div>

        </section>
    );
}