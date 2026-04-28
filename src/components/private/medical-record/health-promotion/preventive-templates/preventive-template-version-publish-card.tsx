"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiCheckCircle, FiFolder } from "react-icons/fi";
import { useToast } from "@/components/ui/toast/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { publishPreventiveTemplateVersionAction } from "@/action/health-promotion/preventive-template/publish-preventive-template-version-action";
import { archivePreventiveTemplateVersionAction } from "@/action/health-promotion/preventive-template/archive-preventive-template-version-action";

type Props = {
    templateId: string;
    versionId: string;
    version: number;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    isCurrentlyPublished: boolean;
    totalSections: number;
};

export function PreventiveTemplateVersionPublishCard({
    templateId,
    versionId,
    version,
    status,
    isCurrentlyPublished,
    totalSections,
}: Props) {
    const router = useRouter();
    const toast = useToast();
    const [isPending, startTransition] = useTransition();

    const [publishOpen, setPublishOpen] = useState(false);
    const [archiveOpen, setArchiveOpen] = useState(false);

    function handlePublish() {
        startTransition(async () => {
            const res = await publishPreventiveTemplateVersionAction(
                templateId,
                versionId
            );

            if (!res.ok) {
                toast.error("Erreur", res.message || "Impossible de publier la version.");
                return;
            }

            toast.success("Succès", "La version a été publiée avec succès.");
            setPublishOpen(false);
            router.refresh();
        });
    }

    function handleArchive() {
        startTransition(async () => {
            const res = await archivePreventiveTemplateVersionAction(
                templateId,
                versionId
            );

            if (!res.ok) {
                toast.error("Erreur", res.message || "Impossible d’archiver la version.");
                return;
            }

            toast.success("Succès", "La version a été archivée avec succès.");
            setArchiveOpen(false);
            router.refresh();
        });
    }

    const canPublish = !isCurrentlyPublished && status !== "ARCHIVED" && totalSections > 0;
    const canArchive = !isCurrentlyPublished && status !== "ARCHIVED";

    return (
        <>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Publication et cycle de vie
                </h2>

                <div className="mt-5 space-y-4">
                    <InfoRow
                        label="Version"
                        value={`v${version}`}
                    />
                    <InfoRow
                        label="Sections disponibles"
                        value={String(totalSections)}
                    />
                    <InfoRow
                        label="Version active"
                        value={isCurrentlyPublished ? "Oui" : "Non"}
                    />
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3">
                    <button
                        type="button"
                        onClick={() => setPublishOpen(true)}
                        disabled={!canPublish || isPending}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-emerald-400 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <FiCheckCircle className="h-4 w-4" />
                        Publier cette version
                    </button>

                    <button
                        type="button"
                        onClick={() => setArchiveOpen(true)}
                        disabled={!canArchive || isPending}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                    >
                        <FiFolder className="h-4 w-4" />
                        Archiver cette version
                    </button>
                </div>

                <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 dark:bg-cyan-500/10">
                    <p className="text-sm leading-6 text-cyan-700 dark:text-cyan-300">
                        Une publication remplace la version active précédente du même modèle.
                        Une version doit contenir au moins une section avant publication.
                    </p>
                </div>
            </div>

            <ConfirmDialog
                open={publishOpen}
                onClose={() => {
                    if (isPending) return;
                    setPublishOpen(false);
                }}
                onConfirm={handlePublish}
                pending={isPending}
                variant="info"
                title="Publier cette version"
                description={`La version v${version} deviendra la version active du modèle. La version publiée précédente sera archivée automatiquement.`}
                confirmLabel="Publier"
                cancelLabel="Annuler"
            />

            <ConfirmDialog
                open={archiveOpen}
                onClose={() => {
                    if (isPending) return;
                    setArchiveOpen(false);
                }}
                onConfirm={handleArchive}
                pending={isPending}
                variant="warning"
                title="Archiver cette version"
                description={`La version v${version} sera archivée et ne pourra plus être utilisée comme version active.`}
                confirmLabel="Archiver"
                cancelLabel="Annuler"
            />
        </>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {label}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                {value}
            </p>
        </div>
    );
}