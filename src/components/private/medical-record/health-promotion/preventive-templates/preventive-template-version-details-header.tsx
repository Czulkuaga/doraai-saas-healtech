"use client";

import { useRouter } from "next/navigation";
import { FiArrowLeft, FiLayers } from "react-icons/fi";

type Props = {
    templateId: string;
    templateName: string;
    version: number;
};

export function PreventiveTemplateVersionDetailsHeader({
    templateId,
    templateName,
    version,
}: Props) {
    const router = useRouter();

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Détail de la version
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {templateName} · version {version}
                </p>

                
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() =>
                        router.push(`/medical-record/health-promotion/templates/${templateId}`)
                    }
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                    <FiArrowLeft className="h-4 w-4" />
                    Retour au modèle
                </button>

                <button
                    type="button"
                    onClick={() =>
                        router.push(
                            `/medical-record/health-promotion/templates/${templateId}`
                        )
                    }
                    className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-emerald-400 hover:to-cyan-400"
                >
                    <FiLayers className="h-4 w-4" />
                    Voir le modèle
                </button>
            </div>
        </div>
    );
}