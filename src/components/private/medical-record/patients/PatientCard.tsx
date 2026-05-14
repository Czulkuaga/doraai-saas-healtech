"use client";

import { calculateAge } from "@/lib/date/calculate-age";

type PatientItem = {
    id: string;

    firstName: string | null;
    lastName: string | null;

    email: string | null;
    phone: string | null;

    birthDate: Date | null;

    isActive: boolean;

    preventiveCasesCount?: number;

    providerName?: string | null;
};

type Props = {
    patient: PatientItem;

    onEdit: (id: string) => void;
    onView: (id: string) => void;
};

export function PatientCard({
    patient,
    onEdit,
    onView,
}: Props) {
    const fullName =
        [patient.firstName, patient.lastName]
            .filter(Boolean)
            .join(" ") || "Sans nom";

    const age = calculateAge(patient.birthDate);

    return (
        <div className="group rounded-3xl border border-[#eaedf0] bg-white p-6 shadow-sm transition-all hover:border-primary/20 hover:shadow-xl dark:border-gray-800 dark:bg-slate-800">
            <div className="flex flex-col gap-6 md:flex-row">

                {/* LEFT */}
                <div className="flex-1 space-y-4">
                    <div className="flex items-start gap-4">

                        {/* Avatar */}
                        <div className="flex size-20 items-center justify-center rounded-2xl bg-slate-200 text-2xl font-black text-primary dark:bg-slate-700">
                            {fullName.charAt(0)}
                        </div>

                        {/* Infos */}
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-xl font-black text-[#101917] dark:text-white">
                                    {fullName}
                                </h3>

                                <span
                                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${patient.isActive
                                            ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300"
                                            : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                        }`}
                                >
                                    {patient.isActive ? "Actif" : "Inactif"}
                                </span>
                            </div>

                            <p className="text-sm font-medium text-[#5a8c84] dark:text-gray-400">
                                {age !== null
                                    ? `${age} ans`
                                    : "Date de naissance inconnue"}
                            </p>

                            <div className="flex flex-col gap-1 pt-1">
                                {patient.phone && (
                                    <div className="text-xs text-[#5a8c84] dark:text-gray-400">
                                        📞 {patient.phone}
                                    </div>
                                )}

                                {patient.email && (
                                    <div className="text-xs text-[#5a8c84] dark:text-gray-400">
                                        ✉️ {patient.email}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* DOSSIERS */}
                    <div className="rounded-2xl bg-slate-100 p-4 dark:bg-gray-700/50">
                        <p className="text-xs font-bold uppercase tracking-tight text-primary">
                            Suivis Préventifs
                        </p>

                        <div className="mt-2 flex items-end justify-between">
                            <div>
                                <p className="text-3xl font-black text-[#101917] dark:text-white">
                                    {patient.preventiveCasesCount ?? 0}
                                </p>

                                <p className="text-xs text-[#5a8c84] dark:text-gray-400">
                                    Suivi actif
                                </p>
                            </div>

                            {patient.providerName && (
                                <div className="text-right">
                                    <p className="text-[10px] uppercase text-[#5a8c84] dark:text-gray-500">
                                        MÉDECIN RÉFÉRENT
                                    </p>

                                    <p className="text-sm font-bold text-[#101917] dark:text-white">
                                        {patient.providerName}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="w-full space-y-3 md:w-64">
                    <button
                        onClick={() => onView(patient.id)}
                        className="cursor-pointer flex h-11 w-full items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 text-xs font-bold text-dark dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-400 transition-all hover:brightness-110"
                    >
                        Fiche Clinique
                    </button>

                    <button
                        onClick={() => onEdit(patient.id)}
                        className="cursor-pointer flex h-11 w-full items-center justify-center rounded-xl border border-[#e9f1f0] bg-white text-xs font-bold text-[#101917] transition-all hover:bg-gray-50 hover:dark:bg-slate-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                        Modifier le patient
                    </button>
                </div>
            </div>
        </div>
    );
}