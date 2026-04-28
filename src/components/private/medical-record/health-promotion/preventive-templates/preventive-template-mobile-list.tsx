"use client";

import { FiEdit2, FiEye, FiLayers } from "react-icons/fi";
import Link from "next/link";
import type { PreventiveTemplateListItem } from "@/lib/types/health-promotion/preventive-template/preventive-template.types";
import { PreventiveTemplateStatusBadge } from "./preventive-template-status-badge";
import { PreventiveTemplateActiveBadge } from "./preventive-template-active-badge";
import { getPreventiveTemplateInitials } from "@/lib/types/health-promotion/preventive-template/preventive-template.helpers";

type Props = {
    items: PreventiveTemplateListItem[];
    onEdit: (id: string) => void;
    onView: (id: string) => void;
};

export function PreventiveTemplateMobileList({
    items,
    onEdit,
    onView,
}: Props) {
    return (
        <div className="space-y-3 md:hidden">
            {items.map((item) => (
                <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
                >
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500/20 to-cyan-500/20 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                            {getPreventiveTemplateInitials(item.name)}
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {item.name}
                                </p>
                                <PreventiveTemplateStatusBadge status={item.status} />
                                <PreventiveTemplateActiveBadge isActive={item.isActive} />
                            </div>

                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {item.code}
                            </p>

                            <div className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                                <p>Service: {item.serviceTypeName || "—"}</p>
                                <p>Spécialité: {item.specialtyName || "—"}</p>
                                <p>
                                    Version publiée:{" "}
                                    {item.publishedVersionNumber
                                        ? `v${item.publishedVersionNumber}`
                                        : "—"}
                                </p>
                                <p>Versions: {item.totalVersions}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                        <ActionButton
                            label="Voir"
                            onClick={() => onView(item.id)}
                            icon={<FiEye className="h-4 w-4" />}
                        />
                        <ActionButton
                            label="Éditer"
                            onClick={() => onEdit(item.id)}
                            icon={<FiEdit2 className="h-4 w-4" />}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

function ActionButton({
    label,
    onClick,
    icon,
}: {
    label: string;
    onClick: () => void;
    icon: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex flex-col items-center justify-center gap-1 rounded-2xl border border-slate-200 bg-white px-2 py-2.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}