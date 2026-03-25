"use client";

import { useRouter } from "next/navigation";
import { FiArrowLeft, FiEdit2 } from "react-icons/fi";

type Props = {
    id: string;
};

export function PatientProviderAssignmentDetailsHeader({ id }: Props) {
    const router = useRouter();

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center md:justify-between">
            <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Détail de l’affectation
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Consultez les informations complètes de la relation patient-professionnel.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() => router.push("/organization/patient-assignments")}
                    className="cursor-pointer inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                    <FiArrowLeft className="h-4 w-4" />
                    Retour
                </button>

                <button
                    type="button"
                    onClick={() =>
                        router.push(`/organization/patient-assignments/${id}/edit`)
                    }
                    className="cursor-pointer inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-emerald-400 hover:to-cyan-400"
                >
                    <FiEdit2 className="h-4 w-4" />
                    Modifier
                </button>
            </div>
        </div>
    );
}