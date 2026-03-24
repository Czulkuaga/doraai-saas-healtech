"use client";

import { ChangeEvent } from "react";
import { RoleListStatus } from "@/lib/types/roles/role.types";

type Props = {
    q: string;
    status: RoleListStatus;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: RoleListStatus) => void;
    onReset: () => void;
};

export default function RolesFilters({
    q,
    status,
    onSearchChange,
    onStatusChange,
    onReset,
}: Props) {
    return (
        <div className="rounded-3xl border border-emerald-500/10 bg-white p-4 shadow-sm dark:bg-slate-950">
            <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
                <input
                    value={q}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
                    placeholder="Rechercher par nom ou clé"
                    className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                />

                <select
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value as RoleListStatus)}
                    className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actifs</option>
                    <option value="inactive">Inactifs</option>
                </select>

                <button
                    type="button"
                    onClick={onReset}
                    className="h-11 rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:border-cyan-500 hover:text-cyan-600 dark:border-slate-800 dark:text-slate-200"
                >
                    Réinitialiser
                </button>
            </div>
        </div>
    );
}