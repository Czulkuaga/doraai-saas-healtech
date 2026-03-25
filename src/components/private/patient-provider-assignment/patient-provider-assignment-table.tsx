"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiEdit2, FiEye, FiPower, FiStar } from "react-icons/fi";
import type { PatientProviderAssignmentListItem } from "@/lib/types/patient-provider-assignment/patient-provider-assignment.types";
import { PatientProviderAssignmentMobileList } from "./patient-provider-assignment-mobile-list";
import { PatientProviderAssignmentStatusBadge } from "./patient-provider-assignment-status-badge";
import { PatientProviderAssignmentTypeBadge } from "./patient-provider-assignment-type-badge";
import { togglePatientProviderAssignmentAction } from "@/action/patient-provider-assignment/toggle-patient-provider-assignment-action";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getPatientProviderAssignmentInitials } from "@/lib/types/patient-provider-assignment/patient-provider-assignment.helpers";

type Props = {
    items: PatientProviderAssignmentListItem[];
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

export function PatientProviderAssignmentTable({
    items,
    onEdit,
    onView,
}: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [toggleOpen, setToggleOpen] = useState(false);
    const [toggleTarget, setToggleTarget] =
        useState<PatientProviderAssignmentListItem | null>(null);
    const [toggleNextValue, setToggleNextValue] = useState(false);

    function handleOpenToggle(item: PatientProviderAssignmentListItem) {
        setToggleTarget(item);
        setToggleNextValue(!item.isActive);
        setToggleOpen(true);
    }

    function handleCloseToggle() {
        if (isPending) return;
        setToggleOpen(false);
        setToggleTarget(null);
        setToggleNextValue(false);
    }

    function handleConfirmToggle() {
        if (!toggleTarget) return;

        startTransition(async () => {
            const res = await togglePatientProviderAssignmentAction(toggleTarget.id);

            if (!res.ok) {
                console.error(res.message);
                return;
            }

            handleCloseToggle();
            router.refresh();
        });
    }

    return (
        <>
            <PatientProviderAssignmentMobileList
                items={items}
                onEdit={onEdit}
                onView={onView}
                onToggle={handleOpenToggle}
            />

            <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 md:block">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/70">
                            <tr className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                <th className="px-5 py-4">Patient</th>
                                <th className="px-5 py-4">Professionnel</th>
                                <th className="px-5 py-4">Type</th>
                                <th className="px-5 py-4">Principal</th>
                                <th className="px-5 py-4">Début</th>
                                <th className="px-5 py-4">Fin</th>
                                <th className="px-5 py-4">Statut</th>
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
                                                {getPatientProviderAssignmentInitials(item)}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                                                    <Link
                                                        href={`/organization/patient-assignments/${item.id}`}
                                                        className="hover:underline"
                                                    >
                                                        {item.patient.label}
                                                    </Link>
                                                </p>
                                                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                                    {item.patient.code}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                                        <div className="min-w-0">
                                            <p className="truncate font-medium">
                                                {item.provider.label}
                                            </p>
                                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                                {item.provider.code}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        <PatientProviderAssignmentTypeBadge
                                            type={item.assignmentType}
                                        />
                                    </td>

                                    <td className="px-5 py-4">
                                        {item.isPrimary ? (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                                                <FiStar className="h-3 w-3" />
                                                Oui
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">—</span>
                                        )}
                                    </td>

                                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                                        {formatDate(item.startDate)}
                                    </td>

                                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                                        {formatDate(item.endDate)}
                                    </td>

                                    <td className="px-5 py-4">
                                        <PatientProviderAssignmentStatusBadge
                                            isActive={item.isActive}
                                        />
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
                                            <IconButton
                                                title={item.isActive ? "Désactiver" : "Activer"}
                                                onClick={() => handleOpenToggle(item)}
                                                icon={<FiPower className="h-4 w-4" />}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmDialog
                open={toggleOpen}
                onClose={handleCloseToggle}
                onConfirm={handleConfirmToggle}
                pending={isPending}
                variant={toggleNextValue ? "info" : "warning"}
                title={
                    toggleNextValue
                        ? "Réactiver l’affectation"
                        : "Désactiver l’affectation"
                }
                description={
                    toggleTarget
                        ? toggleNextValue
                            ? `L’affectation entre ${toggleTarget.patient.label} et ${toggleTarget.provider.label} redeviendra active.`
                            : `L’affectation entre ${toggleTarget.patient.label} et ${toggleTarget.provider.label} sera désactivée.`
                        : "Cette affectation sera mise à jour."
                }
                confirmLabel={toggleNextValue ? "Réactiver" : "Désactiver"}
                cancelLabel="Annuler"
            />
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