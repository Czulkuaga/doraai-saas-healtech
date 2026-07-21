"use client";

import { useState, useTransition } from "react";
import {
    CalendarDays,
    CheckCircle2,
    ExternalLink,
    Loader2,
    Settings2,
    Unplug,
} from "lucide-react";

import { disconnectSimplyBookAction } from "../../../../action/integrations/simplybook/disconnect-simplybook.action";

import type { SimplyBookConnectionSummary } from "@/lib/integrations/simplybook/simplybook.types";

import { SimplyBookConnectionModal } from "./simplybook-connection-modal";
import { SimplyBookStatusBadge } from "./simplybook-status-badge";
import Image from "next/image";

type Props = {
    initialConnection:
    | SimplyBookConnectionSummary
    | null;
};

const emptyConnection: SimplyBookConnectionSummary = {
    configured: false,
    status: "NOT_CONFIGURED",

    authMethod: null,

    displayName: null,
    companyLogin: null,
    userLogin: null,
    apiBaseUrl: null,
    domain: null,

    hasApiUserKey: false,
    hasPassword: false,
    hasAccessToken: false,
    hasRefreshToken: false,

    require2fa: false,
    allowed2faProviders: [],

    connectedAt: null,
    lastValidatedAt: null,

    lastErrorCode: null,
    lastErrorMessage: null,
};

export function SimplyBookIntegrationCard({
    initialConnection,
}: Props) {
    const [connection, setConnection] =
        useState<SimplyBookConnectionSummary>(
            initialConnection ?? emptyConnection
        );

    const [isModalOpen, setIsModalOpen] =
        useState(false);

    const [message, setMessage] =
        useState<string | null>(null);

    const [isPending, startTransition] =
        useTransition();

    const isConnected =
        connection.status === "CONNECTED";

    function handleDisconnect() {
        const confirmed = window.confirm(
            "Voulez-vous déconnecter SimplyBook.me ?"
        );

        if (!confirmed) {
            return;
        }

        setMessage(null);

        startTransition(async () => {
            const result =
                await disconnectSimplyBookAction();

            if (!result.success) {
                setMessage(result.error);
                return;
            }

            setConnection({
                ...emptyConnection,

                configured: true,
                status: "DISABLED",

                authMethod: connection.authMethod,

                displayName: connection.displayName,
                companyLogin: connection.companyLogin,
                userLogin: connection.userLogin,
                apiBaseUrl: connection.apiBaseUrl,
                domain: connection.domain,

                hasApiUserKey: connection.hasApiUserKey,
                hasPassword: connection.hasPassword,
            });

            setMessage(
                "SimplyBook.me a été déconnecté."
            );
        });
    }

    return (
        <>
            <article className="flex min-h-72 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex h-18 px-3 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-gray-200 dark:text-emerald-300">
                        <Image
                            src="/files/images/SimplyBookme.png"
                            alt="SimplyBook.me"
                            width={200}
                            height={80}
                        />
                    </div>

                    <SimplyBookStatusBadge
                        status={connection.status}
                    />
                </div>

                <div className="mt-5">
                    {/* <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
                        SimplyBook.me
                    </h2> */}

                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        Synchronisez les clients et les
                        rendez-vous de SimplyBook.me avec
                        Medicloud.
                    </p>
                </div>

                {isConnected && (
                    <div className="mt-5 space-y-2 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-900">
                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="size-4" />
                            Connexion active
                        </div>

                        {connection.companyLogin && (
                            <p className="text-slate-600 dark:text-slate-400">
                                Société:{" "}
                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                    {
                                        connection.companyLogin
                                    }
                                </span>
                            </p>
                        )}

                        {connection.userLogin && (
                            <p className="text-slate-600 dark:text-slate-400">
                                Utilisateur:{" "}
                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                    {connection.userLogin}
                                </span>
                            </p>
                        )}

                        {connection.authMethod && (
                            <p className="text-slate-600 dark:text-slate-400">
                                Authentification:{" "}
                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                    {connection.authMethod === "API_USER_KEY"
                                        ? "API User Key"
                                        : "Mot de passe"}
                                </span>
                            </p>
                        )}

                        {connection.domain && (
                            <p className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                <ExternalLink className="size-3.5" />
                                {connection.domain}
                            </p>
                        )}

                    </div>
                )}

                {message && (
                    <p className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                        {message}
                    </p>
                )}

                {connection.lastErrorMessage && (
                    <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                        {connection.lastErrorMessage}
                    </p>
                )}

                <div className="mt-auto flex gap-2 pt-6">
                    <button
                        type="button"
                        onClick={() =>
                            setIsModalOpen(true)
                        }
                        className="cursor-pointer inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50 dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600"
                    >
                        <Settings2 className="size-4" />

                        {isConnected
                            ? "Configurer"
                            : "Connecter"}
                    </button>

                    {isConnected && (
                        <button
                            type="button"
                            onClick={handleDisconnect}
                            disabled={isPending}
                            className="cursor-pointer inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
                        >
                            {isPending ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Unplug className="size-4" />
                            )}
                        </button>
                    )}
                </div>
            </article>

            <SimplyBookConnectionModal
                open={isModalOpen}
                initialConnection={connection}
                onClose={() =>
                    setIsModalOpen(false)
                }
                onConnected={(newConnection) => {
                    setConnection(newConnection);
                    setIsModalOpen(false);
                    setMessage(
                        "Connexion SimplyBook.me établie."
                    );
                }}
            />
        </>
    );
}