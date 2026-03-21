"use client";

import { FiEdit2, FiEye, FiPower, FiTrash2 } from "react-icons/fi";
import {
    getBusinessPartnerDisplayName,
    getBusinessPartnerInitials,
    getPartnerTypeLabel,
} from "@/lib/types/business-partner/business-partner.helpers";
import type { BusinessPartnerListItem } from "@/lib/types/business-partner/business-partner.types";
import { BusinessPartnerRoleBadges } from "./business-partner-role-badges";
import { BusinessPartnerStatusBadge } from "./business-partner-status-badge";

type Props = {
    items: BusinessPartnerListItem[];
    onEdit: (id: string) => void;
    onView: (id: string) => void;
    onToggle: (item: BusinessPartnerListItem) => void;
    onDelete: (item: BusinessPartnerListItem) => void;
};

export function BusinessPartnerMobileList({
    items,
    onEdit,
    onView,
    onToggle,
    onDelete,
}: Props) {
    return (
        <div className="space-y-3 md:hidden">
            {items.map((bp) => (
                <div
                    key={bp.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
                >
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500/20 to-cyan-500/20 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                            {getBusinessPartnerInitials(bp)}
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {getBusinessPartnerDisplayName(bp)}
                                </p>
                                <BusinessPartnerStatusBadge isActive={bp.isActive} />
                            </div>

                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {bp.code} · {getPartnerTypeLabel(bp.type)}
                            </p>

                            <div className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                                <p>{bp.email || "—"}</p>
                                <p>{bp.phone || "—"}</p>
                            </div>

                            <div className="mt-3">
                                <BusinessPartnerRoleBadges roles={bp.roles} />
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-4 gap-2">
                        <ActionButton
                            label="Voir"
                            onClick={() => onView(bp.id)}
                            icon={<FiEye className="h-4 w-4" />}
                        />
                        <ActionButton
                            label="Éditer"
                            onClick={() => onEdit(bp.id)}
                            icon={<FiEdit2 className="h-4 w-4" />}
                        />
                        <ActionButton
                            label={bp.isActive ? "Off" : "On"}
                            onClick={() => onToggle(bp)}
                            icon={<FiPower className="h-4 w-4" />}
                        />
                        <ActionButton
                            label="Suppr."
                            danger
                            onClick={() => onDelete(bp)}
                            icon={<FiTrash2 className="h-4 w-4" />}
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
    danger = false,
}: {
    label: string;
    onClick: () => void;
    icon: React.ReactNode;
    danger?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "inline-flex flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-2.5 text-xs font-medium transition",
                danger
                    ? "border-rose-500/20 bg-rose-500/5 text-rose-600 hover:bg-rose-500/10 dark:text-rose-300"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
            ].join(" ")}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}