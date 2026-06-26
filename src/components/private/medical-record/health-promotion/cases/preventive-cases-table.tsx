// preventive-cases-table.tsx

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PreventiveCaseStatus } from "../../../../../../generated/prisma/enums";
import type {
    PreventiveCaseListItem,
    PreventiveCaseQuery,
    PreventiveCaseSortBy,
} from "@/lib/types/health-promotion/case/preventive-case.types";

import {
    cancelPreventiveCaseAction,
    deletePreventiveCaseAction,
} from "@/action/health-promotion/case/preventive-case.actions";

import { useToast } from "@/components/ui/toast/use-toast";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Props = {
    items: PreventiveCaseListItem[];
    query: PreventiveCaseQuery;
};

function statusLabel(status: PreventiveCaseStatus) {
    switch (status) {
        case PreventiveCaseStatus.OPEN:
            return "Ouvert";
        case PreventiveCaseStatus.ACTIVE:
            return "Active";
        case PreventiveCaseStatus.COMPLETED:
            return "Complété";
        case PreventiveCaseStatus.CANCELLED:
            return "Annulé";
        default:
            return status;
    }
}

export function PreventiveCasesTable({ items, query }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const toast = useToast();
    const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
    const [confirmType, setConfirmType] = useState<"cancel" | "delete" | null>(null);
    const [isPending, setIsPending] = useState(false);

    function sort(sortBy: PreventiveCaseSortBy) {
        const params = new URLSearchParams(searchParams.toString());

        const nextSortDir =
            query.sortBy === sortBy && query.sortDir === "asc" ? "desc" : "asc";

        params.set("sortBy", sortBy);
        params.set("sortDir", nextSortDir);

        router.push(`/medical-record/health-promotion/cases?${params.toString()}`);
    }

    function SortButton({
        label,
        value,
    }: {
        label: string;
        value: PreventiveCaseSortBy;
    }) {
        const active = query.sortBy === value;

        return (
            <button
                type="button"
                onClick={() => sort(value)}
                className="cursor-pointer inline-flex items-center gap-1 text-xs font-medium uppercase text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
                {label}
                {active && <span>{query.sortDir === "asc" ? "↑" : "↓"}</span>}
            </button>
        );
    }

    async function handleConfirm() {
        if (!selectedCaseId || !confirmType) return;

        setIsPending(true);

        const result =
            confirmType === "cancel"
                ? await cancelPreventiveCaseAction({ id: selectedCaseId })
                : await deletePreventiveCaseAction({ id: selectedCaseId });

        setIsPending(false);

        if (!result.ok) {
            toast.error("Erreur", result.message);
            return;
        }

        toast.success("Succès", result.message);
        setSelectedCaseId(null);
        setConfirmType(null);
        router.refresh();
    }

    return (
        <>
            <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="overflow-x-auto w-full">
                    <table className="min-w-225 w-full divide-y divide-slate-200 dark:divide-slate-800">
                        <thead className="bg-slate-50 dark:bg-slate-900">
                            <tr>
                                <th className="px-4 py-3 text-left">
                                    <SortButton label="Code" value="code" />
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <SortButton label="Patient" value="patient" />
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <SortButton label="Modèle" value="template" />
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <SortButton label="Statut" value="status" />
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <SortButton label="Ouvert le" value="openedAt" />
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {items.map((item) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-900/60"
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                                        {item.code}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                                        {item.patientName}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                        {item.templateName}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                        {statusLabel(item.status)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                                        {new Intl.DateTimeFormat("fr-BE").format(item.openedAt)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.push(
                                                        `/medical-record/health-promotion/cases/${item.id}`
                                                    )
                                                }
                                                className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                                            >
                                                Voir
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.push(
                                                        `/medical-record/health-promotion/cases/${item.id}/edit`
                                                    )
                                                }
                                                // className="cursor-pointer rounded-lg bg-blue-300 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-400"
                                                className="cursor-pointer rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-[#60a5fa]"
                                            >
                                                Modifier
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedCaseId(item.id);
                                                    setConfirmType("cancel");
                                                }}
                                                disabled={
                                                    item.status === PreventiveCaseStatus.COMPLETED ||
                                                    item.status === PreventiveCaseStatus.CANCELLED
                                                }
                                                className="cursor-pointer rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950/40"
                                            >
                                                Annuler
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedCaseId(item.id);
                                                    setConfirmType("delete");
                                                }}
                                                disabled={item.status !== PreventiveCaseStatus.OPEN}
                                                className="cursor-pointer rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/40"
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {items.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                                    >
                                        Aucun cas préventif trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <ConfirmDialog
                open={Boolean(confirmType)}
                title={
                    confirmType === "cancel"
                        ? "Annuler le cas préventif"
                        : "Supprimer le cas préventif"
                }
                description={
                    confirmType === "cancel"
                        ? "Ce cas sera marqué comme annulé. Les données existantes seront conservées."
                        : "Cette action supprimera définitivement le cas uniquement s’il ne contient aucune réponse."
                }
                confirmLabel={confirmType === "cancel" ? "Annuler le cas" : "Supprimer"}
                cancelLabel="Retour"
                variant={confirmType === "cancel" ? "warning" : "danger"}
                pending={isPending}
                onConfirm={handleConfirm}
                onClose={() => {
                    if (isPending) return;

                    setSelectedCaseId(null);
                    setConfirmType(null);
                }}
            />
        </>
    );
}