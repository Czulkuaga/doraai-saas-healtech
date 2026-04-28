"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiArrowRight, FiEdit2, FiList, FiPlus, FiTrash2 } from "react-icons/fi";

import { useToast } from "@/components/ui/toast/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deletePreventiveTemplateSectionAction } from "@/action/health-promotion/preventive-template/delete-preventive-template-section-action";

type SectionItem = {
    id: string;
    key: string;
    title: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
    fieldsCount: number;
};

type Props = {
    templateId: string;
    versionId: string;
    sections: SectionItem[];
    versionStatus?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

export function PreventiveTemplateVersionSectionsCard({
    templateId,
    versionId,
    sections,
    versionStatus = "DRAFT",
}: Props) {
    const router = useRouter();
    const toast = useToast();
    const [isPending, startTransition] = useTransition();

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<SectionItem | null>(null);

    const canEditVersion = versionStatus === "DRAFT";

    function handleOpenDelete(section: SectionItem) {
        setDeleteTarget(section);
        setDeleteOpen(true);
    }

    function handleCloseDelete() {
        if (isPending) return;
        setDeleteOpen(false);
        setDeleteTarget(null);
    }

    function handleConfirmDelete() {
        if (!deleteTarget) return;

        startTransition(async () => {
            const res = await deletePreventiveTemplateSectionAction(
                templateId,
                versionId,
                deleteTarget.id
            );

            if (!res.ok) {
                toast.error("Erreur", res.message);
                return;
            }

            toast.success("Succès", "La section a été supprimée.");
            setDeleteOpen(false);
            setDeleteTarget(null);
            router.refresh();
        });
    }

    return (
        <>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500/15 to-cyan-500/15 text-cyan-600 dark:text-cyan-300">
                            <FiList className="h-5 w-5" />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                Sections de la version
                            </h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Structure clinique actuelle de la version.
                            </p>
                        </div>
                    </div>

                    {canEditVersion ? (
                        <Link
                            href={`/medical-record/health-promotion/templates/${templateId}/versions/${versionId}/sections/new`}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-emerald-400 hover:to-cyan-400"
                        >
                            <FiPlus className="h-4 w-4" />
                            Nouvelle section
                        </Link>
                    ) : null}
                </div>

                {sections.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900/40">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Aucune section n’est encore définie pour cette version.
                        </p>
                    </div>
                ) : (
                    <div className="mt-6 space-y-3">
                        {sections.map((section) => {
                            const canDelete =
                                canEditVersion && section.fieldsCount === 0;

                            return (
                                <div
                                    key={section.id}
                                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40 md:flex-row md:items-center md:justify-between"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            {section.order}. {section.title}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            {section.key} · {section.fieldsCount} champ
                                            {section.fieldsCount > 1 ? "s" : ""}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {canEditVersion ? (
                                            <Link
                                                href={`/medical-record/health-promotion/templates/${templateId}/versions/${versionId}/sections/${section.id}/edit`}
                                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                                            >
                                                <FiEdit2 className="h-4 w-4" />
                                                Modifier
                                            </Link>
                                        ) : null}

                                        {canDelete ? (
                                            <button
                                                type="button"
                                                onClick={() => handleOpenDelete(section)}
                                                disabled={isPending}
                                                className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/20 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:text-rose-300"
                                            >
                                                <FiTrash2 className="h-4 w-4" />
                                                Supprimer
                                            </button>
                                        ) : null}

                                        <Link
                                            href={`/medical-record/health-promotion/templates/${templateId}/versions/${versionId}/sections/${section.id}`}
                                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                                        >
                                            Voir
                                            <FiArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={deleteOpen}
                onClose={handleCloseDelete}
                onConfirm={handleConfirmDelete}
                pending={isPending}
                variant="danger"
                title="Supprimer la section"
                description={
                    deleteTarget
                        ? `La section « ${deleteTarget.title} » sera supprimée définitivement.`
                        : "Cette section sera supprimée définitivement."
                }
                confirmLabel="Supprimer"
                cancelLabel="Annuler"
            />
        </>
    );
}