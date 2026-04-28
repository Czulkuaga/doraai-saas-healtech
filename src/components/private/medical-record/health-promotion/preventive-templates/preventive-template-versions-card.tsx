"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { FiEye, FiTrash2 } from "react-icons/fi";
import { useRouter } from "next/navigation";

import { useToast } from "@/components/ui/toast/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { deletePreventiveTemplateVersionAction } from "@/action/health-promotion/preventive-template/delete-preventive-template-version-action";

type VersionItem = {
    id: string;
    version: number;
    status: string;
    publishedAt: Date | null;
    createdAt: Date;
};

type Props = {
    templateId: string;
    publishedVersionId?: string | null;
    versions: VersionItem[];
};

function formatDate(value?: Date | null) {
    if (!value) return "—";
    return new Intl.DateTimeFormat("fr-BE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date(value));
}

function getStatusBadge(status: string) {
    if (status === "PUBLISHED") {
        return (
            <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300">
                Publiée
            </span>
        );
    }

    if (status === "DRAFT") {
        return (
            <span className="inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-300">
                Brouillon
            </span>
        );
    }

    return (
        <span className="inline-flex rounded-full border border-slate-500/20 bg-slate-500/10 px-2.5 py-1 text-xs font-medium text-slate-500 dark:text-slate-300">
            Archivée
        </span>
    );
}

export function PreventiveTemplateVersionsCard({
    templateId,
    publishedVersionId,
    versions,
}: Props) {
    const router = useRouter();
    const toast = useToast();
    const [isPending, startTransition] = useTransition();

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<VersionItem | null>(null);

    function handleOpenDelete(item: VersionItem) {
        setDeleteTarget(item);
        setDeleteOpen(true);
    }

    function handleConfirmDelete() {
        if (!deleteTarget) return;

        startTransition(async () => {
            const res = await deletePreventiveTemplateVersionAction(
                templateId,
                deleteTarget.id
            );

            if (!res.ok) {
                toast.error("Erreur", res.message);
                return;
            }

            toast.success("Succès", "La version a été supprimée.");

            setDeleteOpen(false);
            setDeleteTarget(null);

            router.refresh();
        });
    }

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Versions du modèle
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Gérez les versions cliniques et préparez leur publication.
                    </p>
                </div>
            </div>

            {versions.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900/40">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Aucune version disponible.
                    </p>
                </div>
            ) : (
                <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/70">
                            <tr className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                <th className="px-5 py-4">Version</th>
                                <th className="px-5 py-4">Statut</th>
                                <th className="px-5 py-4">Active</th>
                                <th className="px-5 py-4">Publiée le</th>
                                <th className="px-5 py-4">Créée le</th>
                                <th className="px-5 py-4 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {versions.map((item) => {
                                const isPublished =
                                    publishedVersionId === item.id;

                                const canDelete =
                                    item.status === "DRAFT" &&
                                    !isPublished;

                                return (
                                    <tr
                                        key={item.id}
                                        className="border-t border-slate-200 dark:border-slate-800"
                                    >
                                        <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">
                                            Version {item.version}
                                        </td>

                                        <td className="px-5 py-4">
                                            {getStatusBadge(item.status)}
                                        </td>

                                        <td className="px-5 py-4">
                                            {isPublished ? (
                                                <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300">
                                                    Oui
                                                </span>
                                            ) : (
                                                "—"
                                            )}
                                        </td>

                                        <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                                            {formatDate(item.publishedAt)}
                                        </td>

                                        <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                                            {formatDate(item.createdAt)}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/medical-record/health-promotion/templates/${templateId}/versions/${item.id}`}
                                                    className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                                                >
                                                    <FiEye className="h-4 w-4" />
                                                    Voir
                                                </Link>

                                                {canDelete && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleOpenDelete(
                                                                item
                                                            )
                                                        }
                                                        className="cursor-pointer inline-flex items-center gap-1 rounded-2xl border border-rose-500/20 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-500/10 dark:text-rose-300"
                                                        disabled={isPending}
                                                    >
                                                        <FiTrash2 className="h-4 w-4" />
                                                        Supprimer
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmDialog
                open={deleteOpen}
                onClose={() => {
                    if (isPending) return;
                    setDeleteOpen(false);
                    setDeleteTarget(null);
                }}
                onConfirm={handleConfirmDelete}
                pending={isPending}
                variant="danger"
                title="Supprimer la version"
                description={
                    deleteTarget
                        ? `La version ${deleteTarget.version} sera supprimée définitivement.`
                        : "Cette version sera supprimée définitivement."
                }
                confirmLabel="Supprimer"
                cancelLabel="Annuler"
            />
        </div>
    );
}