"use client";

import { useRouter } from "next/navigation";
import { FiUserPlus } from "react-icons/fi";
import { PatientProviderAssignmentTable } from "./patient-provider-assignment-table";
import { PatientProviderAssignmentFilters } from "./patient-provider-assignment-filters";
import { PatientProviderAssignmentEmptyState } from "./patient-provider-assignment-empty-state";
import type {
    PatientProviderAssignmentFilters as QueryType,
    PatientProviderAssignmentListItem,
    PatientProviderAssignmentTypeValue,
} from "@/lib/types/patient-provider-assignment/patient-provider-assignment.types";
import { LiaUserInjuredSolid } from "react-icons/lia";

type PatientAssignmentsQuery = {
    q?: string;
    patientId?: string;
    providerProfileId?: string;
    assignmentType?: "" | PatientProviderAssignmentTypeValue;
    isActive?: "" | "true" | "false";
    isPrimary?: "" | "true" | "false";
    page?: number;
    pageSize?: number;
};

type Props = {
    items: PatientProviderAssignmentListItem[];
    totalItems: number;
    page: number;
    pageSize: number;
    totalPages: number;
    query: QueryType;
};

export function PatientProviderAssignmentShell({
    items,
    totalItems,
    page,
    pageSize,
    totalPages,
    query,
}: Props) {
    const router = useRouter();

    const onQueryChange = (
        patch: Partial<PatientAssignmentsQuery>
    ) => {
        const next: PatientAssignmentsQuery = {
            ...query,
            ...patch,
        };

        const affectsPagination =
            "q" in patch ||
            "patientId" in patch ||
            "providerProfileId" in patch ||
            "assignmentType" in patch ||
            "isActive" in patch ||
            "isPrimary" in patch;

        if (affectsPagination) {
            next.page = 1;
        }

        const keys = Object.keys(next) as Array<keyof PatientAssignmentsQuery>;

        const didChange = keys.some((key) => {
            const prevValue = query[key];
            const nextValue = next[key];
            return String(prevValue ?? "") !== String(nextValue ?? "");
        });

        if (!didChange) return;

        const params = new URLSearchParams();

        keys.forEach((key) => {
            const value = next[key];

            if (
                value === undefined ||
                value === null ||
                value === "" ||
                value === "ALL"
            ) {
                return;
            }

            params.set(String(key), String(value));
        });

        router.replace(
            `/organization/patient-assignments${params.toString() ? `?${params.toString()}` : ""
            }`
        );
    };

    return (
        <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500/15 to-cyan-500/15 text-cyan-600 dark:text-cyan-300">
                            <LiaUserInjuredSolid size={18} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                Affectations patient-professionnel
                            </h1>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Gérez les liens entre patients et professionnels pour le suivi préventif.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                            {totalItems} affectation{totalItems > 1 ? "s" : ""}
                        </div>

                        <button
                            type="button"
                            onClick={() => router.push("/organization/patient-assignments/new")}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-emerald-400 hover:to-cyan-400"
                        >
                            <FiUserPlus className="h-4 w-4" />
                            Ajouter une affectation
                        </button>
                    </div>
                </div>
            </div>

            <PatientProviderAssignmentFilters query={query} onChange={onQueryChange} />

            {items.length === 0 ? (
                <PatientProviderAssignmentEmptyState
                    onCreate={() => router.push("/organization/patient-assignments/new")}
                />
            ) : (
                <>
                    <PatientProviderAssignmentTable
                        items={items}
                        onEdit={(id) =>
                            router.push(`/organization/patient-assignments/${id}/edit`)
                        }
                        onView={(id) =>
                            router.push(`/organization/patient-assignments/${id}`)
                        }
                    />

                    <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950 md:flex-row md:items-center md:justify-between">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Affichage de {(page - 1) * pageSize + 1} à{" "}
                            {Math.min(page * pageSize, totalItems)} sur {totalItems}
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => onQueryChange({ page: page - 1 })}
                                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                            >
                                Précédent
                            </button>

                            <div className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-800 dark:text-slate-200">
                                Page {page} / {totalPages}
                            </div>

                            <button
                                type="button"
                                disabled={page >= totalPages}
                                onClick={() => onQueryChange({ page: page + 1 })}
                                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}