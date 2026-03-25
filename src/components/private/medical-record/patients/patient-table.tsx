"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiEdit2, FiEye, FiPower, FiTrash2 } from "react-icons/fi";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deletePatientAction } from "@/action/patients/delete-patient";
import { togglePatientStatusAction } from "@/action/patients/toggle-patient";
import {
    getPatientDisplayName,
    getPatientInitials,
    getPatientTypeLabel,
} from "@/lib/types/patients/patients.helpers";
import type { PatientListItem } from "@/lib/types/patients/patients.types";
import { PatientStatusBadge } from "./patient-status-badge";
import { PatientMobileList } from "./patient-mobile-list";

type Props = {
    items: PatientListItem[];
    page: number;
    totalPages: number;
    onEdit: (id: string) => void;
    onView: (id: string) => void;
};

export function PatientTable({
    items,
    onEdit,
    onView,
}: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [toggleOpen, setToggleOpen] = useState(false);

    const [selectedItem, setSelectedItem] = useState<PatientListItem | null>(null);
    const [toggleTarget, setToggleTarget] = useState<PatientListItem | null>(null);
    const [toggleNextValue, setToggleNextValue] = useState(false);

    function handleOpenDelete(item: PatientListItem) {
        setSelectedItem(item);
        setDeleteOpen(true);
    }

    function handleCloseDelete() {
        if (isPending) return;
        setDeleteOpen(false);
        setSelectedItem(null);
    }

    function handleOpenToggle(item: PatientListItem) {
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

    function handleConfirmDelete() {
        if (!selectedItem) return;

        startTransition(async () => {
            const res = await deletePatientAction(selectedItem.id);

            if (!res.ok) {
                console.error(res.message);
                return;
            }

            handleCloseDelete();
            router.refresh();
        });
    }

    function handleConfirmToggle() {
        if (!toggleTarget) return;

        startTransition(async () => {
            const res = await togglePatientStatusAction(toggleTarget.id);

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
            <PatientMobileList
                items={items}
                onEdit={onEdit}
                onView={onView}
                onToggle={handleOpenToggle}
                onDelete={handleOpenDelete}
            />

            <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 md:block">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/70">
                            <tr className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                <th className="px-5 py-4">Patient</th>
                                <th className="px-5 py-4">E-mail</th>
                                <th className="px-5 py-4">Téléphone</th>
                                <th className="px-5 py-4">Type</th>
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
                                                {getPatientInitials(item)}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                                                    {getPatientDisplayName(item)}
                                                </p>
                                                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                                    {item.code}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                                        {item.email || "—"}
                                    </td>

                                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                                        {item.phone || "—"}
                                    </td>

                                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                                        {getPatientTypeLabel(item.type)}
                                    </td>

                                    <td className="px-5 py-4">
                                        <PatientStatusBadge isActive={item.isActive} />
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
                                            <IconButton
                                                title="Supprimer"
                                                danger
                                                onClick={() => handleOpenDelete(item)}
                                                icon={<FiTrash2 className="h-4 w-4" />}
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
                open={deleteOpen}
                onClose={handleCloseDelete}
                onConfirm={handleConfirmDelete}
                pending={isPending}
                variant="danger"
                title="Supprimer le patient"
                description={
                    selectedItem
                        ? `Le patient ${getPatientDisplayName(selectedItem)} sera supprimé définitivement.`
                        : "Ce patient sera supprimé définitivement."
                }
                confirmLabel="Supprimer"
                cancelLabel="Annuler"
            />

            <ConfirmDialog
                open={toggleOpen}
                onClose={handleCloseToggle}
                onConfirm={handleConfirmToggle}
                pending={isPending}
                variant={toggleNextValue ? "info" : "warning"}
                title={toggleNextValue ? "Réactiver le patient" : "Désactiver le patient"}
                description={
                    toggleTarget
                        ? toggleNextValue
                            ? `Le patient ${getPatientDisplayName(toggleTarget)} redeviendra actif dans le module médical.`
                            : `Le patient ${getPatientDisplayName(toggleTarget)} sera désactivé dans le module médical.`
                        : toggleNextValue
                            ? "Ce patient redeviendra actif dans le module médical."
                            : "Ce patient sera désactivé dans le module médical."
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
    danger = false,
}: {
    title: string;
    icon: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
}) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={[
                "inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition",
                danger
                    ? "border-rose-500/20 bg-rose-500/5 text-rose-600 hover:bg-rose-500/10 dark:text-rose-300"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
            ].join(" ")}
        >
            {icon}
        </button>
    );
}