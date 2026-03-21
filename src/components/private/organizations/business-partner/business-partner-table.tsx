"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiEdit2, FiEye, FiPower, FiTrash2 } from "react-icons/fi";
import {
    getBusinessPartnerDisplayName,
    getBusinessPartnerInitials,
    getPartnerTypeLabel,
} from "@/lib/types/business-partner/business-partner.helpers";
import type { BusinessPartnerListItem } from "@/lib/types/business-partner/business-partner.types";
import { BusinessPartnerRoleBadges } from "./business-partner-role-badges";
import { BusinessPartnerStatusBadge } from "./business-partner-status-badge";
import { BusinessPartnerMobileList } from "./business-partner-mobile-list";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteBusinessPartnerAction } from "@/action/business-partner/delete-business-partner";
import { toggleBusinessPartnerStatusAction } from "@/action/business-partner/toggle-business-partner";
import Link from "next/link";

type Props = {
    items: BusinessPartnerListItem[];
    page: number;
    totalPages: number;
    onEdit: (id: string) => void;
    onView: (id: string) => void;
};

export function BusinessPartnerTable({
    items,
    onEdit,
    onView,
}: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [toggleOpen, setToggleOpen] = useState(false);

    const [selectedItem, setSelectedItem] = useState<BusinessPartnerListItem | null>(null);
    const [toggleTarget, setToggleTarget] = useState<BusinessPartnerListItem | null>(null);
    const [toggleNextValue, setToggleNextValue] = useState(false);

    function handleOpenDelete(item: BusinessPartnerListItem) {
        setSelectedItem(item);
        setDeleteOpen(true);
    }

    function handleCloseDelete() {
        if (isPending) return;
        setDeleteOpen(false);
        setSelectedItem(null);
    }

    function handleOpenToggle(item: BusinessPartnerListItem) {
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
            const res = await deleteBusinessPartnerAction(selectedItem.id);

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
            const res = await toggleBusinessPartnerStatusAction(toggleTarget.id);

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
            <BusinessPartnerMobileList
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
                                <th className="px-5 py-4">Tiers</th>
                                <th className="px-5 py-4">E-mail</th>
                                <th className="px-5 py-4">Téléphone</th>
                                <th className="px-5 py-4">Type</th>
                                <th className="px-5 py-4">Rôles</th>
                                <th className="px-5 py-4">Statut</th>
                                <th className="px-5 py-4 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {items.map((bp) => (
                                <tr
                                    key={bp.id}
                                    className="border-t border-slate-200 dark:border-slate-800"
                                >
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500/20 to-cyan-500/20 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                                                {getBusinessPartnerInitials(bp)}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                                                    <Link href={`/organization/business-partner/${bp.id}`} className="hover:underline">
                                                        {getBusinessPartnerDisplayName(bp)}
                                                    </Link>
                                                </p>
                                                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                                    {bp.code}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                                        {bp.email || "—"}
                                    </td>

                                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                                        {bp.phone || "—"}
                                    </td>

                                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                                        {getPartnerTypeLabel(bp.type)}
                                    </td>

                                    <td className="px-5 py-4">
                                        <BusinessPartnerRoleBadges roles={bp.roles} />
                                    </td>

                                    <td className="px-5 py-4">
                                        <BusinessPartnerStatusBadge isActive={bp.isActive} />
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <IconButton
                                                title="Voir"
                                                onClick={() => onView(bp.id)}
                                                icon={<FiEye className="h-4 w-4" />}
                                            />
                                            <IconButton
                                                title="Éditer"
                                                onClick={() => onEdit(bp.id)}
                                                icon={<FiEdit2 className="h-4 w-4" />}
                                            />
                                            <IconButton
                                                title={bp.isActive ? "Désactiver" : "Activer"}
                                                onClick={() => handleOpenToggle(bp)}
                                                icon={<FiPower className="h-4 w-4" />}
                                            />
                                            <IconButton
                                                title="Supprimer"
                                                danger
                                                onClick={() => handleOpenDelete(bp)}
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
                title="Supprimer le tiers"
                description={
                    selectedItem
                        ? `Le tiers ${getBusinessPartnerDisplayName(selectedItem)} sera supprimé définitivement.`
                        : "Ce tiers sera supprimé définitivement."
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
                title={toggleNextValue ? "Réactiver le tiers" : "Désactiver le tiers"}
                description={
                    toggleTarget
                        ? toggleNextValue
                            ? `Le tiers ${getBusinessPartnerDisplayName(toggleTarget)} redeviendra actif dans l’organisation.`
                            : `Le tiers ${getBusinessPartnerDisplayName(toggleTarget)} sera désactivé dans l’organisation.`
                        : toggleNextValue
                            ? "Ce tiers redeviendra actif dans l’organisation."
                            : "Ce tiers sera désactivé dans l’organisation."
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
                "inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition cursor-pointer",
                danger
                    ? "border-rose-500/20 bg-rose-500/5 text-rose-600 hover:bg-rose-500/10 dark:text-rose-300"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
            ].join(" ")}
        >
            {icon}
        </button>
    );
}