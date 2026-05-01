// preventive-cases-pagination.tsx

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { PreventiveCaseQuery } from "@/lib/types/health-promotion/case/preventive-case.types";

type Props = {
    query: PreventiveCaseQuery;
    totalItems: number;
    totalPages: number;
};

export function PreventiveCasesPagination({
    query,
    totalItems,
    totalPages,
}: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    function goToPage(page: number) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(page));

        router.push(`/medical-record/health-promotion/cases?${params.toString()}`);
    }

    const from = totalItems === 0 ? 0 : (query.page - 1) * query.pageSize + 1;
    const to = Math.min(query.page * query.pageSize, totalItems);

    return (
        <div className="w-full flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>
                {from} - {to} de {totalItems}
            </span>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    disabled={query.page <= 1}
                    onClick={() => goToPage(query.page - 1)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                    Précédent
                </button>

                <span className="text-sm text-slate-600 dark:text-slate-400">
                    Page {query.page} / {totalPages}
                </span>

                <button
                    type="button"
                    disabled={query.page >= totalPages}
                    onClick={() => goToPage(query.page + 1)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                    Suivant
                </button>
            </div>
        </div>
    );
}