"use client";

import Link from "next/link";
import { FiEdit2, FiPrinter } from "react-icons/fi";
import { FaArrowLeft } from "react-icons/fa6";

import {
    patientEditPath,
    patientListPath,
} from "@/lib/types/patients/patients.routes";

import { useState, useTransition } from "react";
import { updatePatientPathologiesAction } from "@/action/patients/update-patient-pathologies";

type Patient = {
    id: string;
    code?: string | null;
    firstName: string | null;
    lastName: string | null;
    organizationName: string | null;
    birthDate?: Date | null;
    phone?: string | null;
    email?: string | null;
    isActive?: boolean;
};

type PatientPathology = {
    id: string;
    patientPathologyId?: string;
    code: string;
    name: string;
    color?: string | null;
    description?: string | null;
    notes?: string | null;
    diagnosedAt?: Date | null;
};

type Assignment = {
    providerName?: string | null;
    isPrimary?: boolean;
    isActive?: boolean;
};

type Props = {
    patient: Patient;
    assignments: Assignment[];
    pathologies: PatientPathology[];
    availablePathologies: PatientPathology[];
};

function getPatientName(patient: Patient) {
    const fullName = [patient.firstName, patient.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

    return fullName || patient.organizationName || "—";
}

function getAge(birthDate?: Date | null) {
    if (!birthDate) return null;

    const today = new Date();
    const birth = new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
        age--;
    }

    return age;
}

function getInitials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

export function PatientClinicalHeader({ patient, assignments, pathologies, availablePathologies }: Props) {

    const [isPathologyModalOpen, setIsPathologyModalOpen] = useState(false);

    const patientName = getPatientName(patient);
    const age = getAge(patient.birthDate);

    const activeProviders = assignments.filter((item) => item.isActive);

    const primaryProvider =
        activeProviders.find((item) => item.isPrimary) || activeProviders[0];

    const providerLabel =
        activeProviders.length === 0
            ? "Non assigné"
            : activeProviders.length === 1
                ? primaryProvider?.providerName || "Non assigné"
                : `${primaryProvider?.providerName || "Professionnel"} +${activeProviders.length - 1}`;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col gap-6 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="relative flex size-18 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-cyan-500 text-2xl font-bold text-white ring-4 ring-emerald-500/10">
                        {getInitials(patientName) || "P"}

                        <span
                            className={`absolute bottom-1 -right-2 h-6 w-6 rounded-full border-2 border-white dark:border-slate-950 ${patient.isActive === false
                                ? "bg-slate-400"
                                : "bg-emerald-500"
                                }`}
                        />
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                {patientName}
                                {age !== null ? `, ${age} ans` : ""}
                            </h1>

                            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                                Patient
                            </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
                            <span>
                                Code patient:{" "}
                                <strong className="font-medium text-slate-900 dark:text-slate-200">
                                    {patient.code || "—"}
                                </strong>
                            </span>

                            <span>
                                Médecin référent:{" "}
                                <strong
                                    title={activeProviders
                                        .map((item) => item.providerName)
                                        .filter(Boolean)
                                        .join(", ")}
                                    className="font-medium text-slate-900 dark:text-slate-200"
                                >
                                    {providerLabel}
                                </strong>
                            </span>
                        </div>

                        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                            {patient.phone && (
                                <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                    {patient.phone}
                                </span>
                            )}

                            {patient.email && (
                                <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                    {patient.email}
                                </span>
                            )}
                        </div>

                        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900">
                            <div className="mb-2 flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                    Pathologies suivies
                                </p>

                                <button
                                    type="button"
                                    onClick={() => setIsPathologyModalOpen(true)}
                                    className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-500/20 dark:text-emerald-300"
                                >
                                    Gérer
                                </button>
                            </div>

                            {pathologies.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {pathologies.map((item) => (
                                        <span
                                            key={item.id}
                                            className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300"
                                        >
                                            {item.name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Aucune pathologie configurée pour le moment.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
                    <Link
                        href={patientListPath()}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <FaArrowLeft className="h-4 w-4" />
                        Retour
                    </Link>

                    <Link
                        href={patientEditPath(patient.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-emerald-400 hover:to-cyan-400"
                    >
                        <FiEdit2 className="h-4 w-4" />
                        Modifier
                    </Link>

                    <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <FiPrinter className="h-4 w-4" />
                        Imprimer
                    </button>
                </div>
            </div>


            {isPathologyModalOpen && (
                <PatientPathologiesModal
                    patientId={patient.id}
                    selectedPathologies={pathologies}
                    availablePathologies={availablePathologies}
                    onClose={() => setIsPathologyModalOpen(false)}
                />
            )}
        </section>
    );
}


function PatientPathologiesModal({
    patientId,
    selectedPathologies,
    availablePathologies,
    onClose,
}: {
    patientId: string;
    selectedPathologies: PatientPathology[];
    availablePathologies: PatientPathology[];
    onClose: () => void;
}) {
    const [isPending, startTransition] = useTransition();

    const [selected, setSelected] = useState<string[]>(
        selectedPathologies.map((item) => item.id)
    );

    function toggle(id: string) {
        setSelected((current) =>
            current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id]
        );
    }

    function onSave() {
        startTransition(async () => {
            await updatePatientPathologiesAction({
                patientId,
                pathologyIds: selected,
            });

            onClose();
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-950">
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                            Gérer les pathologies
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Sélectionnez les pathologies suivies pour ce patient.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-900"
                    >
                        ✕
                    </button>
                </div>

                <div className="grid max-h-[360px] gap-2 overflow-y-auto sm:grid-cols-2">
                    {availablePathologies.map((item) => {
                        const checked = selected.includes(item.id);

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => toggle(item.id)}
                                disabled={isPending}
                                className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition disabled:opacity-60 ${checked
                                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                                    }`}
                            >
                                <span>{item.name}</span>
                                {item.code && (
                                    <span className="mt-1 block text-[10px] font-medium uppercase text-slate-400">
                                        {item.code}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        Annuler
                    </button>

                    <button
                        type="button"
                        onClick={onSave}
                        disabled={isPending}
                        className="rounded-xl bg-linear-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:from-emerald-400 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isPending ? "Enregistrement..." : "Enregistrer"}
                    </button>
                </div>
            </div>
        </div>
    );
}