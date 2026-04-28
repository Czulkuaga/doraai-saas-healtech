"use client";

import Link from "next/link";
import { FiEdit2, FiEye } from "react-icons/fi";
import type { PreventiveTemplateListItem } from "@/lib/types/health-promotion/preventive-template/preventive-template.types";
import { PreventiveTemplateMobileList } from "./preventive-template-mobile-list";
import { PreventiveTemplateStatusBadge } from "./preventive-template-status-badge";
import { PreventiveTemplateActiveBadge } from "./preventive-template-active-badge";
import { getPreventiveTemplateInitials } from "@/lib/types/health-promotion/preventive-template/preventive-template.helpers";

type Props = {
    items: PreventiveTemplateListItem[];
    onEdit: (id: string) => void;
    onView: (id: string) => void;
};

function formatDate(value?: string | null) {
    if (!value) return "—";
    return new Intl.DateTimeFormat("fr-BE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date(value));
}

export function PreventiveTemplateTable({
    items,
    onEdit,
    onView,
}: Props) {
    return (
        <>
            <PreventiveTemplateMobileList
                items={items}
                onEdit={onEdit}
                onView={onView}
            />

            <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 md:block">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/70">
                            <tr className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                <th className="px-5 py-4">Modèle</th>
                                <th className="px-5 py-4">Service</th>
                                <th className="px-5 py-4">Spécialité</th>
                                <th className="px-5 py-4">Statut</th>
                                <th className="px-5 py-4">Actif</th>
                                <th className="px-5 py-4">Version publiée</th>
                                <th className="px-5 py-4">Versions</th>
                                <th className="px-5 py-4">Mis à jour</th>
                                <th className="px-5 py-4 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {items.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-t border-slate-200 dark:border-slate-800"
                                >
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500/20 to-cyan-500/20 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                                                {getPreventiveTemplateInitials(item.name)}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                                                    <Link
                                                        href={`/medical-record/health-promotion/templates/${item.id}`}
                                                        className="hover:underline"
                                                    >
                                                        {item.name}
                                                    </Link>
                                                </p>
                                                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                                    {item.code}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                                        {item.serviceTypeName || "—"}
                                    </td>

                                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                                        {item.specialtyName || "—"}
                                    </td>

                                    <td className="px-5 py-4">
                                        <PreventiveTemplateStatusBadge status={item.status} />
                                    </td>

                                    <td className="px-5 py-4">
                                        <PreventiveTemplateActiveBadge isActive={item.isActive} />
                                    </td>

                                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                                        {item.publishedVersionNumber
                                            ? `v${item.publishedVersionNumber}`
                                            : "—"}
                                    </td>

                                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                                        {item.totalVersions}
                                    </td>

                                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                                        {formatDate(item.updatedAt)}
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <IconButton
                                                title="Voir"
                                                onClick={() => onView(item.id)}
                                                icon={<FiEye className="h-4 w-4" />}
                                            />
                                            <IconButton
                                                title="Éditer"
                                                onClick={() => onEdit(item.id)}
                                                icon={<FiEdit2 className="h-4 w-4" />}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

function IconButton({
    title,
    icon,
    onClick,
}: {
    title: string;
    icon: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
            {icon}
        </button>
    );
}