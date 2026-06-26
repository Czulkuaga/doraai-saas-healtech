"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
    FollowUpFrequency,
    PreventiveCaseStatus,
    PreventiveRiskLevel,
} from "../../../../../../generated/prisma/enums";

import { createPreventiveCaseAction } from "@/action/health-promotion/case/preventive-case.actions";
import { useToast } from "@/components/ui/toast/use-toast";

type Option = {
    id: string;
    name: string;
    code?: string;
};

type Props = {
    patients: Option[];
    pathologies: Option[];
    providers: Option[];
    orgUnits: Option[];
    locations: Option[];
    serviceTypes: Option[];
    specialties: Option[];
};

type FieldErrors = Partial<{
    patientId: string[];
    title: string[];
    pathologyId: string[];
    providerProfileId: string[];
    orgUnitId: string[];
    locationId: string[];
    serviceTypeId: string[];
    specialtyId: string[];
    riskLevel: string[];
    followUpFrequency: string[];
    followUpIntervalDays: string[];
    nextFollowUpAt: string[];
    notes: string[];
}>;

const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

export function CreatePreventiveCaseForm({
    patients,
    pathologies,
    providers,
    orgUnits,
    locations,
    serviceTypes,
    specialties,
}: Props) {
    const router = useRouter();
    const toast = useToast();

    const [patientId, setPatientId] = useState("");
    const [title, setTitle] = useState("");
    const [pathologyId, setPathologyId] = useState("");
    const [providerProfileId, setProviderProfileId] = useState("");
    const [orgUnitId, setOrgUnitId] = useState("");
    const [locationId, setLocationId] = useState("");
    const [serviceTypeId, setServiceTypeId] = useState("");
    const [specialtyId, setSpecialtyId] = useState("");
    const [riskLevel, setRiskLevel] = useState("");
    const [followUpFrequency, setFollowUpFrequency] = useState("");
    const [followUpIntervalDays, setFollowUpIntervalDays] = useState("");
    const [nextFollowUpAt, setNextFollowUpAt] = useState("");
    const [notes, setNotes] = useState("");

    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [isPending, setIsPending] = useState(false);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setIsPending(true);
        setFieldErrors({});

        const result = await createPreventiveCaseAction({
            patientId,
            title,
            status: PreventiveCaseStatus.OPEN,
            pathologyId,
            providerProfileId,
            orgUnitId,
            locationId,
            serviceTypeId,
            specialtyId,
            riskLevel: riskLevel || null,
            followUpFrequency: followUpFrequency || null,
            followUpIntervalDays: followUpIntervalDays
                ? Number(followUpIntervalDays)
                : null,
            nextFollowUpAt: nextFollowUpAt ? new Date(nextFollowUpAt) : null,
            notes,
        });

        setIsPending(false);

        if (!result.ok) {
            if ("fieldErrors" in result && result.fieldErrors) {
                setFieldErrors(result.fieldErrors);
            }

            toast.error("Erreur", result.message);
            return;
        }

        toast.success("Succès", result.message);
        router.push(`/medical-record/health-promotion/cases/${result.data.id}/edit`);
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Informations du dossier
                    </h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Sélectionnez le patient, la pathologie éventuelle et le professionnel responsable.
                    </p>
                </div>

                <div className="grid gap-5 p-5 md:grid-cols-2">
                    <Field label="Patient" required error={fieldErrors.patientId?.[0]}>
                        <select
                            value={patientId}
                            onChange={(event) => setPatientId(event.target.value)}
                            disabled={isPending}
                            className={inputClass}
                        >
                            <option value="">Sélectionner un patient...</option>
                            {patients.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Titre" error={fieldErrors.title?.[0]}>
                        <input
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            disabled={isPending}
                            className={inputClass}
                            placeholder="Suivi préventif – Hypertension"
                        />
                    </Field>

                    <Field label="Pathologie" error={fieldErrors.pathologyId?.[0]}>
                        <select
                            value={pathologyId}
                            onChange={(event) => setPathologyId(event.target.value)}
                            disabled={isPending}
                            className={inputClass}
                        >
                            <option value="">Cas général / manuel</option>
                            {pathologies.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                    {item.code ? ` (${item.code})` : ""}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field
                        label="Professionnel responsable"
                        error={fieldErrors.providerProfileId?.[0]}
                    >
                        <select
                            value={providerProfileId}
                            onChange={(event) => setProviderProfileId(event.target.value)}
                            disabled={isPending}
                            className={inputClass}
                        >
                            <option value="">Non assigné</option>
                            {providers.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Niveau de risque" error={fieldErrors.riskLevel?.[0]}>
                        <select
                            value={riskLevel}
                            onChange={(event) => setRiskLevel(event.target.value)}
                            disabled={isPending}
                            className={inputClass}
                        >
                            <option value="">Non défini</option>
                            {Object.values(PreventiveRiskLevel).map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field
                        label="Fréquence de suivi"
                        error={fieldErrors.followUpFrequency?.[0]}
                    >
                        <select
                            value={followUpFrequency}
                            onChange={(event) => setFollowUpFrequency(event.target.value)}
                            disabled={isPending}
                            className={inputClass}
                        >
                            <option value="">Non définie</option>
                            {Object.values(FollowUpFrequency).map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field
                        label="Intervalle personnalisé en jours"
                        error={fieldErrors.followUpIntervalDays?.[0]}
                    >
                        <input
                            type="number"
                            min={0}
                            value={followUpIntervalDays}
                            onChange={(event) => setFollowUpIntervalDays(event.target.value)}
                            disabled={isPending}
                            className={inputClass}
                            placeholder="90"
                        />
                    </Field>

                    <Field
                        label="Prochain contrôle manuel"
                        error={fieldErrors.nextFollowUpAt?.[0]}
                    >
                        <input
                            type="date"
                            value={nextFollowUpAt}
                            onChange={(event) => setNextFollowUpAt(event.target.value)}
                            disabled={isPending}
                            className={inputClass}
                        />
                    </Field>

                    <Field label="Type de service" error={fieldErrors.serviceTypeId?.[0]}>
                        <select
                            value={serviceTypeId}
                            onChange={(event) => setServiceTypeId(event.target.value)}
                            disabled={isPending}
                            className={inputClass}
                        >
                            <option value="">Non assigné</option>
                            {serviceTypes.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Spécialité" error={fieldErrors.specialtyId?.[0]}>
                        <select
                            value={specialtyId}
                            onChange={(event) => setSpecialtyId(event.target.value)}
                            disabled={isPending}
                            className={inputClass}
                        >
                            <option value="">Non assignée</option>
                            {specialties.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field
                        label="Unité organisationnelle"
                        error={fieldErrors.orgUnitId?.[0]}
                    >
                        <select
                            value={orgUnitId}
                            onChange={(event) => setOrgUnitId(event.target.value)}
                            disabled={isPending}
                            className={inputClass}
                        >
                            <option value="">Non assignée</option>
                            {orgUnits.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Lieu / site" error={fieldErrors.locationId?.[0]}>
                        <select
                            value={locationId}
                            onChange={(event) => setLocationId(event.target.value)}
                            disabled={isPending}
                            className={inputClass}
                        >
                            <option value="">Non assigné</option>
                            {locations.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </Field>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Notes internes
                    </h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Ces notes seront visibles dans le dossier préventif.
                    </p>
                </div>

                <div className="p-5">
                    <textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        disabled={isPending}
                        rows={5}
                        placeholder="Ajouter une note..."
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                    />

                    <div className="mt-2 flex justify-between gap-3 text-xs">
                        <span className="text-slate-500 dark:text-slate-400">
                            Optionnel
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                            {notes.length}/2000
                        </span>
                    </div>

                    {fieldErrors.notes?.[0] && (
                        <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">
                            {fieldErrors.notes[0]}
                        </p>
                    )}
                </div>
            </section>

            <div className="sticky bottom-0 z-10 -mx-1 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        disabled={isPending}
                        onClick={() => router.push("/medical-record/suivi-cases")}
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        Annuler
                    </button>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isPending ? "Création..." : "Créer et continuer"}
                    </button>
                </div>
            </div>
        </form>
    );
}

function Field({
    label,
    required = false,
    error,
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {label} {required && <span className="text-rose-500">*</span>}
            </label>

            {children}

            {error && (
                <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
            )}
        </div>
    );
}