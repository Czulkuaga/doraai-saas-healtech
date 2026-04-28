"use client";

import { FiLayers } from "react-icons/fi";
import { PreventiveTemplateFilters } from "./preventive-template-filters";
import { PreventiveTemplateTable } from "./preventive-template-table";
import { PreventiveTemplateEmptyState } from "./preventive-template-empty-state";
import type {
    PreventiveTemplateFilters as QueryType,
    PreventiveTemplateListItem,
} from "@/lib/types/health-promotion/preventive-template/preventive-template.types";
import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
    items: PreventiveTemplateListItem[];
    totalItems: number;
    page: number;
    pageSize: number;
    totalPages: number;
    query: QueryType;
};

export function PreventiveTemplateShell({
    items,
    totalItems,
    page,
    pageSize,
    totalPages,
    query,
}: Props) {
    const router = useRouter();

    const pathname = usePathname();
    const searchParams = useSearchParams();

    const onQueryChange = useCallback(
        (patch: Record<string, string | number | undefined>) => {
            const params = new URLSearchParams();

            const next = {
                ...query,
                ...patch,
            };

            Object.entries(next).forEach(([key, value]) => {
                if (value === undefined || value === null || value === "" || value === "ALL") {
                    return;
                }
                params.set(key, String(value));
            });

            const nextQuery = params.toString();
            const currentQuery = searchParams.toString();

            if (nextQuery === currentQuery) return;

            router.push(`${pathname}${nextQuery ? `?${nextQuery}` : ""}`);
        },
        [pathname, query, router, searchParams]
    );

    return (
        <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500/15 to-cyan-500/15 text-cyan-600 dark:text-cyan-300">
                            <FiLayers className="h-5 w-5" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                Modèles préventifs
                            </h1>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Gérez les modèles, leur statut et les versions publiées qui serviront de base au module préventif.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                            {totalItems} modèle{totalItems > 1 ? "s" : ""}
                        </div>

                        <button
                            type="button"
                            onClick={() => router.push("/medical-record/health-promotion/templates/new")}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-emerald-400 hover:to-cyan-400"
                        >
                            <FiLayers className="h-4 w-4" />
                            Nouveau modèle
                        </button>
                    </div>
                </div>
            </div>

            <PreventiveTemplateFilters query={query} onChange={onQueryChange} />

            {items.length === 0 ? (
                <PreventiveTemplateEmptyState
                    onCreate={() => router.push("/medical-record/health-promotion/templates/new")}
                />
            ) : (
                <>
                    <PreventiveTemplateTable
                        items={items}
                        onEdit={(id) =>
                            router.push(`/medical-record/health-promotion/templates/${id}/edit`)
                        }
                        onView={(id) =>
                            router.push(`/medical-record/health-promotion/templates/${id}`)
                        }
                    />

                    <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950 md:flex-row md:items-center md:justify-between">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Affichage de {(page - 1) * pageSize + 1} à{" "}
                            {Math.min(page * pageSize, totalItems)} sur {totalItems}
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => onQueryChange({ page: page - 1 })}
                                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                            >
                                Précédent
                            </button>

                            <div className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-800 dark:text-slate-200">
                                Page {page} / {totalPages}
                            </div>

                            <button
                                type="button"
                                disabled={page >= totalPages}
                                onClick={() => onQueryChange({ page: page + 1 })}
                                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}