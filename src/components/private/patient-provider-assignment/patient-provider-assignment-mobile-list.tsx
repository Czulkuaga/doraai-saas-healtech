"use client";

import { FiEdit2, FiEye, FiPower, FiStar } from "react-icons/fi";
import type { PatientProviderAssignmentListItem } from "@/lib/types/patient-provider-assignment/patient-provider-assignment.types";
import { PatientProviderAssignmentStatusBadge } from "./patient-provider-assignment-status-badge";
import { PatientProviderAssignmentTypeBadge } from "./patient-provider-assignment-type-badge";
import { getPatientProviderAssignmentInitials } from "@/lib/types/patient-provider-assignment/patient-provider-assignment.helpers";

type Props = {
    items: PatientProviderAssignmentListItem[];
    onEdit: (id: string) => void;
    onView: (id: string) => void;
    onToggle: (item: PatientProviderAssignmentListItem) => void;
};

export function PatientProviderAssignmentMobileList({
    items,
    onEdit,
    onView,
    onToggle,
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
                            {getPatientProviderAssignmentInitials(item)}
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {item.patient.label}
                                </p>
                                <PatientProviderAssignmentStatusBadge isActive={item.isActive} />
                                {item.isPrimary ? (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                                        <FiStar className="h-3 w-3" />
                                        Principal
                                    </span>
                                ) : null}
                            </div>

                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {item.patient.code} · {item.provider.label}
                            </p>

                            <div className="mt-3">
                                <PatientProviderAssignmentTypeBadge type={item.assignmentType} />
                            </div>

                            <div className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                                <p>{item.patient.email || "—"}</p>
                                <p>{item.provider.email || "—"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
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
                        <ActionButton
                            label={item.isActive ? "Off" : "On"}
                            onClick={() => onToggle(item)}
                            icon={<FiPower className="h-4 w-4" />}
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