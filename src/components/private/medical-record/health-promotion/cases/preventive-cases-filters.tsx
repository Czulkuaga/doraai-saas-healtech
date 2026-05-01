// preventive-cases-filters.tsx

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PreventiveCaseStatus } from "../../../../../../generated/prisma/enums";
import type { PreventiveCaseQuery } from "@/lib/types/health-promotion/case/preventive-case.types";

type Props = {
    query: PreventiveCaseQuery;
};

export function PreventiveCasesFilters({ query }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    function updateQuery(patch: Record<string, string>) {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(patch).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        params.set("page", "1");

        router.push(`/medical-record/health-promotion/cases?${params.toString()}`);
    }

    return (
        <div className="w-full flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:flex-row md:items-center md:justify-between mb-2">
            <div>
                <input
                    defaultValue={query.q}
                    placeholder="Rechercher par code, patient ou modèle..."
                    onChange={(event) => updateQuery({ q: event.target.value })}
                    className="md:w-150 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 mr-2"
                />

                <select
                    value={query.status}
                    onChange={(event) => updateQuery({ status: event.target.value })}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                    <option value="">Tous les statuts</option>
                    {Object.values(PreventiveCaseStatus).map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>
            </div>


            <select
                value={String(query.pageSize)}
                onChange={(event) => updateQuery({ pageSize: event.target.value })}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
                {[10, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>
                        {size} / page
                    </option>
                ))}
            </select>
        </div>
    );
}