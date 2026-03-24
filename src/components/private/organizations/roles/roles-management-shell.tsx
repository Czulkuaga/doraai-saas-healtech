"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BiPlus } from "react-icons/bi";
import { deleteRoleAction, toggleRoleStatusAction } from "@/action/roles/role.actions";
import { RoleListItem, RolesListResult, RoleListStatus } from "@/lib/types/roles/role.types";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast/use-toast";
import RolesFilters from "./role-filters";
import RolesTable from "./role-table";
import RoleEmptyState from "./role-empty-state";

type ConfirmState =
    | { open: false }
    | {
          open: true;
          type: "delete" | "toggle";
          role: RoleListItem;
      };

export default function RolesManagementShell({
    items,
    totalItems,
    totalPages,
    page,
    q,
    status,
}: RolesListResult) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const toast = useToast();

    const [isPending, startTransition] = useTransition();
    const [busyId, setBusyId] = useState<string | null>(null);
    const [searchDraft, setSearchDraft] = useState(q);
    const [confirmState, setConfirmState] = useState<ConfirmState>({ open: false });

    useEffect(() => {
        setSearchDraft(q);
    }, [q]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchDraft === q) return;
            pushQuery({ q: searchDraft, page: 1 });
        }, 450);

        return () => clearTimeout(timer);
    }, [searchDraft, q]);

    const title = useMemo(() => {
        if (totalItems === 0) return "Aucun rôle";
        if (totalItems === 1) return "1 rôle";
        return `${totalItems} rôles`;
    }, [totalItems]);

    function pushQuery(patch: Record<string, string | number | undefined>) {
        const params = new URLSearchParams(searchParams?.toString() ?? "");

        Object.entries(patch).forEach(([key, value]) => {
            if (value === undefined || value === "" || value === "all") {
                params.delete(key);
            } else {
                params.set(key, String(value));
            }
        });

        const qs = params.toString();
        router.push(qs ? `/organization/roles?${qs}` : "/organization/roles");
    }

    function handleSearchChange(value: string) {
        setSearchDraft(value);
    }

    function handleStatusChange(value: RoleListStatus) {
        pushQuery({ status: value, page: 1 });
    }

    function handleReset() {
        setSearchDraft("");
        router.push("/organization/roles");
    }

    function handlePageChange(nextPage: number) {
        pushQuery({ page: nextPage });
    }

    function handleCreate() {
        router.push("/organization/roles/new");
    }

    function handleAskToggle(item: RoleListItem) {
        setConfirmState({
            open: true,
            type: "toggle",
            role: item,
        });
    }

    function handleAskDelete(item: RoleListItem) {
        setConfirmState({
            open: true,
            type: "delete",
            role: item,
        });
    }

    function handleCloseConfirm() {
        if (isPending) return;
        setConfirmState({ open: false });
    }

    function handleConfirmAction() {
        if (!confirmState.open) return;

        const { role, type } = confirmState;
        setBusyId(role.id);

        startTransition(async () => {
            if (type === "toggle") {
                const result = await toggleRoleStatusAction(role.id, !role.isActive);

                if (!result.ok) {
                    toast.error("Erreur", result.message);
                    setBusyId(null);
                    return;
                }

                toast.success("Succès", result.message);
                setConfirmState({ open: false });
                setBusyId(null);
                router.refresh();
                return;
            }

            const result = await deleteRoleAction(role.id);

            if (!result.ok) {
                toast.error("Erreur", result.message);
                setBusyId(null);
                return;
            }

            toast.success("Succès", result.message);
            setConfirmState({ open: false });
            setBusyId(null);
            router.refresh();
        });
    }

    const confirmTitle =
        confirmState.open && confirmState.type === "toggle"
            ? confirmState.role.isActive
                ? "Confirmer la désactivation"
                : "Confirmer l’activation"
            : "Confirmer la suppression";

    const confirmDescription =
        confirmState.open && confirmState.type === "toggle"
            ? confirmState.role.isActive
                ? `Voulez-vous vraiment désactiver le rôle "${confirmState.role.name}" ?`
                : `Voulez-vous vraiment activer le rôle "${confirmState.role.name}" ?`
            : confirmState.open
              ? `Voulez-vous vraiment supprimer le rôle "${confirmState.role.name}" ?`
              : "";

    const confirmLabel =
        confirmState.open && confirmState.type === "toggle"
            ? confirmState.role.isActive
                ? "Désactiver"
                : "Activer"
            : "Supprimer";

    const confirmVariant =
        confirmState.open && confirmState.type === "toggle" ? "warning" : "danger";

    return (
        <>
            <div className="space-y-5">
                <div className="flex flex-col gap-4 rounded-3xl border border-emerald-500/10 bg-white p-5 shadow-sm dark:bg-slate-950 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            Gestion des rôles
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {title}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleCreate}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white cursor-pointer"
                    >
                        <BiPlus className="h-4 w-4" />
                        Créer un rôle
                    </button>
                </div>

                <RolesFilters
                    q={searchDraft}
                    status={status}
                    onSearchChange={handleSearchChange}
                    onStatusChange={handleStatusChange}
                    onReset={handleReset}
                />

                {items.length === 0 ? (
                    <RoleEmptyState onCreate={handleCreate} />
                ) : (
                    <>
                        <RolesTable
                            items={items}
                            onToggle={handleAskToggle}
                            onDelete={handleAskDelete}
                        />

                        <div className="flex flex-col items-center justify-between gap-3 rounded-3xl border border-emerald-500/10 bg-white p-4 shadow-sm dark:bg-slate-950 md:flex-row">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Page {page} sur {totalPages} · {totalItems} élément(s)
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={page <= 1 || isPending || !!busyId}
                                    onClick={() => handlePageChange(page - 1)}
                                    className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-200"
                                >
                                    Précédent
                                </button>

                                <button
                                    type="button"
                                    disabled={page >= totalPages || isPending || !!busyId}
                                    onClick={() => handlePageChange(page + 1)}
                                    className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-200"
                                >
                                    Suivant
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <ConfirmDialog
                open={confirmState.open}
                title={confirmTitle}
                description={confirmDescription}
                confirmLabel={confirmLabel}
                cancelLabel="Annuler"
                variant={confirmVariant}
                pending={isPending}
                onClose={handleCloseConfirm}
                onConfirm={handleConfirmAction}
            />
        </>
    );
}