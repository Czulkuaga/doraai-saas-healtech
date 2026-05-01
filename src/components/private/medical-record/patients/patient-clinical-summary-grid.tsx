// src/components/private/medical-record/patients/patient-clinical-summary-grid.tsx

type Props = {
    preventiveCasesCount: number;
    activeProvidersCount: number;
};

export function PatientClinicalSummaryGrid({
    preventiveCasesCount,
    activeProvidersCount,
}: Props) {
    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Résumé clinique
                </h2>

                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Données préventives
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <h4 className="text-sm font-bold text-cyan-700 dark:text-cyan-300">
                        Diagnostics actifs
                    </h4>
                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                        Aucun modèle de diagnostic n’est encore configuré.
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <h4 className="text-sm font-bold text-cyan-700 dark:text-cyan-300">
                        Médicaments
                    </h4>
                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                        Aucun médicament enregistré pour le moment.
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <h4 className="text-sm font-bold text-cyan-700 dark:text-cyan-300">
                        Indicateurs
                    </h4>

                    <div className="mt-4 space-y-4">
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Cas préventifs
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {preventiveCasesCount}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Professionnels actifs
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {activeProvidersCount}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:col-span-2">
                    <h4 className="text-sm font-bold text-cyan-700 dark:text-cyan-300">
                        Dernière note clinique
                    </h4>

                    <div className="mt-4 rounded-xl border-l-4 border-cyan-500 bg-slate-50 p-4 dark:bg-slate-900/60">
                        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                            Aucune note clinique n’est encore disponible. Cette section
                            affichera les observations récentes du suivi préventif.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}