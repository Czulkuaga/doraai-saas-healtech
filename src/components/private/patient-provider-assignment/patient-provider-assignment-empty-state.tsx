import { FiUserPlus } from "react-icons/fi";

export function PatientProviderAssignmentEmptyState({
    onCreate,
}: {
    onCreate: () => void;
}) {
    return (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-950">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-linear-to-br from-emerald-500/10 to-cyan-500/10 text-cyan-600 dark:text-cyan-300">
                <FiUserPlus className="h-8 w-8" />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-slate-100">
                Aucune affectation enregistrée
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Ajoutez votre première affectation patient-professionnel pour commencer.
            </p>

            <button
                type="button"
                onClick={onCreate}
                className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-emerald-400 hover:to-cyan-400"
            >
                <FiUserPlus className="h-4 w-4" />
                Ajouter une affectation
            </button>
        </div>
    );
}