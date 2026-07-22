"use client";

import {
    useState,
    useTransition,
} from "react";

import {
    CheckCircle2,
    CircleDashed,
    Loader2,
    RefreshCw,
    Search,
    TriangleAlert,
    UserX,
} from "lucide-react";

import {
    resolveSimplyBookPatientAction,
} from "@/action/integrations/simplybook/resolve-simplybook-patient.action";

type SyncStatus =
    | "NOT_LINKED"
    | "ACTIVE"
    | "NOT_FOUND"
    | "AMBIGUOUS"
    | "DISABLED";

type Props = {
    partnerId: string;

    initialStatus: SyncStatus;

    externalId?: string | null;

    lastMatchedAt?: string | null;
};

export function PatientSimplyBookSyncCard({
    partnerId,
    initialStatus,
    externalId,
    lastMatchedAt,
}: Props) {
    const [status, setStatus] =
        useState<SyncStatus>(
            initialStatus
        );

    const [currentExternalId, setCurrentExternalId] =
        useState<string | null>(
            externalId ?? null
        );

    const [message, setMessage] =
        useState<string | null>(null);

    const [isPending, startTransition] =
        useTransition();

    function handleSearch() {
        setMessage(null);

        startTransition(async () => {
            const result =
                await resolveSimplyBookPatientAction(
                    partnerId
                );

            if (!result.success) {
                setMessage(result.error);
                return;
            }

            switch (result.status) {
                case "LINKED":
                    setStatus("ACTIVE");

                    setCurrentExternalId(
                        result.externalCustomerId
                    );

                    setMessage(
                        "Ce patient est déjà lié à SimplyBook.me."
                    );

                    return;

                case "FOUND":
                    setStatus("ACTIVE");

                    setCurrentExternalId(
                        result.externalCustomerId
                    );

                    setMessage(
                        `Patient identifié automatiquement via ${result.matchedBy.join(
                            ", "
                        )}.`
                    );

                    return;

                case "AMBIGUOUS":
                    setStatus("AMBIGUOUS");

                    setMessage(
                        `${result.candidates.length} correspondance(s) potentielle(s) trouvée(s). Une vérification manuelle est nécessaire.`
                    );

                    return;

                case "NOT_FOUND":
                    setStatus("NOT_FOUND");

                    setCurrentExternalId(null);

                    setMessage(
                        "Aucun client correspondant n'a été trouvé dans SimplyBook.me."
                    );

                    return;
            }
        });
    }

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        SimplyBook.me
                    </p>

                    <div className="mt-2">
                        <StatusIndicator
                            status={status}
                        />
                    </div>

                    {currentExternalId && (
                        <p className="mt-2 text-xs text-slate-500">
                            ID externe:{" "}
                            {currentExternalId}
                        </p>
                    )}

                    {lastMatchedAt && (
                        <p className="mt-1 text-xs text-slate-500">
                            Dernière vérification:{" "}
                            {new Date(
                                lastMatchedAt
                            ).toLocaleString(
                                "fr-BE"
                            )}
                        </p>
                    )}
                </div>

                <button
                    type="button"
                    disabled={isPending}
                    onClick={handleSearch}
                    className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                    {isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : status ===
                        "ACTIVE" ? (
                        <RefreshCw className="size-4" />
                    ) : (
                        <Search className="size-4" />
                    )}

                    {status === "ACTIVE"
                        ? "Vérifier à nouveau"
                        : "Rechercher dans SimplyBook"}
                </button>
            </div>

            {message && (
                <p className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    {message}
                </p>
            )}
        </section>
    );
}

function StatusIndicator({
    status,
}: {
    status: SyncStatus;
}) {
    switch (status) {
        case "ACTIVE":
            return (
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                    <CheckCircle2 className="size-4" />

                    Synchronisé
                </div>
            );

        case "AMBIGUOUS":
            return (
                <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
                    <TriangleAlert className="size-4" />

                    Correspondance à vérifier
                </div>
            );

        case "NOT_FOUND":
            return (
                <div className="flex items-center gap-2 text-sm font-medium text-red-500">
                    <UserX className="size-4" />

                    Non trouvé
                </div>
            );

        default:
            return (
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                    <CircleDashed className="size-4" />

                    Non synchronisé
                </div>
            );
    }
}