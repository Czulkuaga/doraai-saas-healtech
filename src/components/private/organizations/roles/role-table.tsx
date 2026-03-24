"use client";

import Link from "next/link";
import { FiEdit2, FiEye, FiPower, FiTrash2 } from "react-icons/fi";
import { RoleListItem } from "@/lib/types/roles/role.types";
import RoleStatusBadge from "./role-status-badge";

type Props = {
    items: RoleListItem[];
    onToggle: (item: RoleListItem) => void;
    onDelete: (item: RoleListItem) => void;
};

export default function RolesTable({ items, onToggle, onDelete }: Props) {
    return (
        <>
            <div className="hidden overflow-hidden rounded-3xl border border-emerald-500/10 bg-white shadow-sm dark:bg-slate-950 lg:block">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/70">
                            <tr className="text-left text-slate-500 dark:text-slate-400">
                                <th className="px-4 py-3 font-medium">Rôle</th>
                                <th className="px-4 py-3 font-medium">Clé</th>
                                <th className="px-4 py-3 font-medium">Permissions</th>
                                <th className="px-4 py-3 font-medium">Utilisateurs</th>
                                <th className="px-4 py-3 font-medium">Statut</th>
                                <th className="px-4 py-3 font-medium">Type</th>
                                <th className="px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-t border-slate-100 dark:border-slate-900"
                                >
                                    <td className="px-4 py-4">
                                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                                            {item.name}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                                        {item.key}
                                    </td>
                                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                                        {item.permissionsCount}
                                    </td>
                                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                                        {item.membersCount}
                                    </td>
                                    <td className="px-4 py-4">
                                        <RoleStatusBadge isActive={item.isActive} />
                                    </td>
                                    <td className="px-4 py-4">
                                        {item.isSystem ? (
                                            <span className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-700 dark:text-cyan-300">
                                                Système
                                            </span>
                                        ) : (
                                            <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                                                Personnalisé
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/organization/roles/${item.id}`}
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:border-cyan-500 hover:text-cyan-600 dark:border-slate-800 dark:text-slate-200"
                                            >
                                                <FiEye className="h-4 w-4" />
                                            </Link>

                                            <Link
                                                href={`/organization/roles/${item.id}/edit`}
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:border-cyan-500 hover:text-cyan-600 dark:border-slate-800 dark:text-slate-200"
                                            >
                                                <FiEdit2 className="h-4 w-4" />
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={() => onToggle(item)}
                                                disabled={item.isSystem}
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:border-cyan-500 hover:text-cyan-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-200"
                                            >
                                                <FiPower className="h-4 w-4" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => onDelete(item)}
                                                disabled={item.isSystem || item.membersCount > 0}
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-950/40"
                                            >
                                                <FiTrash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid gap-3 lg:hidden">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="rounded-3xl border border-emerald-500/10 bg-white p-4 shadow-sm dark:bg-slate-950"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {item.name}
                                </p>
                                <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                                    {item.key}
                                </p>
                            </div>
                            <RoleStatusBadge isActive={item.isActive} />
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                            <div>Permissions: {item.permissionsCount}</div>
                            <div>Utilisateurs: {item.membersCount}</div>
                            <div>
                                Type: {item.isSystem ? "Système" : "Personnalisé"}
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Link
                                href={`/organization/roles/${item.id}`}
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-800 dark:text-slate-200"
                            >
                                <FiEye className="h-4 w-4" />
                                Voir
                            </Link>

                            <Link
                                href={`/organization/roles/${item.id}/edit`}
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-800 dark:text-slate-200"
                            >
                                <FiEdit2 className="h-4 w-4" />
                                Modifier
                            </Link>

                            <button
                                type="button"
                                onClick={() => onToggle(item)}
                                disabled={item.isSystem}
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-200"
                            >
                                <FiPower className="h-4 w-4" />
                                {item.isActive ? "Désactiver" : "Activer"}
                            </button>

                            <button
                                type="button"
                                onClick={() => onDelete(item)}
                                disabled={item.isSystem || item.membersCount > 0}
                                className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-900/40 dark:text-rose-300"
                            >
                                <FiTrash2 className="h-4 w-4" />
                                Supprimer
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}