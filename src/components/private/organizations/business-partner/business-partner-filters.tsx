"use client";

import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { PARTNER_TYPE_OPTIONS } from "@/lib/types/business-partner/business-partner.catalog";
import type { BusinessPartnerFilters as QueryType } from "@/lib/types/business-partner/business-partner.types";

type Props = {
    query: QueryType;
    onChange: (patch: Record<string, string | number | undefined>) => void;
};

export function BusinessPartnerFilters({ query, onChange }: Props) {
    const [search, setSearch] = useState(query.q ?? "");

    useEffect(() => {
        const t = setTimeout(() => {
            onChange({ q: search || undefined, page: 1 });
        }, 350);

        return () => clearTimeout(t);
    }, [search]);

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
                <div className="relative lg:col-span-5">
                    <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher par nom, e-mail, téléphone ou code..."
                        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
                    />
                </div>

                <div className="lg:col-span-2">
                    <select
                        value={query.type ?? "ALL"}
                        onChange={(e) =>
                            onChange({
                                type: e.target.value === "ALL" ? undefined : e.target.value,
                                page: 1,
                            })
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    >
                        <option value="ALL">Tous les types</option>
                        {PARTNER_TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.labelFr}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="lg:col-span-2">
                    <select
                        value={query.status ?? "ALL"}
                        onChange={(e) =>
                            onChange({
                                status: e.target.value === "ALL" ? undefined : e.target.value,
                                page: 1,
                            })
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    >
                        <option value="ALL">Tous les statuts</option>
                        <option value="ACTIVE">Actifs</option>
                        <option value="INACTIVE">Inactifs</option>
                    </select>
                </div>

                <div className="lg:col-span-2">
                    <select
                        value={query.sort ?? "recent"}
                        onChange={(e) => onChange({ sort: e.target.value, page: 1 })}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    >
                        <option value="recent">Plus récents</option>
                        <option value="oldest">Plus anciens</option>
                        <option value="name_asc">Nom A → Z</option>
                        <option value="name_desc">Nom Z → A</option>
                        <option value="code_asc">Code A → Z</option>
                        <option value="code_desc">Code Z → A</option>
                    </select>
                </div>

                <div className="lg:col-span-1">
                    <select
                        value={query.pageSize ?? 5}
                        onChange={(e) =>
                            onChange({
                                pageSize: Number(e.target.value),
                                page: 1,
                            })
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>
        </div>
    );
}