// src/components/private/medical-record/health-promotion/cases/preventive-case-edit-form.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
    FollowUpFrequency,
    PreventiveCaseStatus,
    PreventiveRiskLevel,
} from "../../../../../../generated/prisma/enums";

import {
    completePreventiveCaseAction,
    updatePreventiveCaseMetaAction,
} from "@/action/health-promotion/case/preventive-case.actions";

import { useToast } from "@/components/ui/toast/use-toast";

type Option = {
    id: string;
    name: string;
    code?: string;
};

type CaseData = {
    id: string;
    code: string;
    title: string | null;
    status: PreventiveCaseStatus;
    notes: string | null;

    riskLevel: PreventiveRiskLevel | null;
    followUpFrequency: FollowUpFrequency | null;
    followUpIntervalDays: number | null;
    nextFollowUpAt: Date | null;
    nextAutomaticFollowUpAt: Date | null;

    pathologyId: string | null;
    providerProfileId: string | null;
    orgUnitId: string | null;
    locationId: string | null;
    serviceTypeId: string | null;
    specialtyId: string | null;

    patientName: string;
};

type Props = {
    caseData: CaseData;
    providers: Option[];
    orgUnits: Option[];
    locations: Option[];
    pathologies: Option[];
    serviceTypes: Option[];
    specialties: Option[];
};

function dateToInputValue(date: Date | null) {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 10);
}

function statusLabel(status: PreventiveCaseStatus) {
    switch (status) {
        case PreventiveCaseStatus.OPEN:
            return "Ouvert";
        case PreventiveCaseStatus.ACTIVE:
            return "Actif";
        case PreventiveCaseStatus.ON_HOLD:
            return "En pause";
        case PreventiveCaseStatus.COMPLETED:
            return "Terminé";
        case PreventiveCaseStatus.CANCELLED:
            return "Annulé";
        default:
            return status;
    }
}

export function PreventiveCaseEditForm({
    caseData,
    providers,
    orgUnits,
    locations,
    pathologies,
    serviceTypes,
    specialties,
}: Props) {
    const router = useRouter();
    const toast = useToast();

    const disabled =
        caseData.status === PreventiveCaseStatus.COMPLETED ||
        caseData.status === PreventiveCaseStatus.CANCELLED;

    const [title, setTitle] = useState(caseData.title ?? "");
    const [status, setStatus] = useState<PreventiveCaseStatus>(caseData.status);
    const [riskLevel, setRiskLevel] = useState(caseData.riskLevel ?? "");
    const [followUpFrequency, setFollowUpFrequency] = useState(
        caseData.followUpFrequency ?? ""
    );
    const [followUpIntervalDays, setFollowUpIntervalDays] = useState(
        caseData.followUpIntervalDays?.toString() ?? ""
    );
    const [nextFollowUpAt, setNextFollowUpAt] = useState(
        dateToInputValue(caseData.nextFollowUpAt)
    );

    const [pathologyId, setPathologyId] = useState(caseData.pathologyId ?? "");
    const [providerProfileId, setProviderProfileId] = useState(
        caseData.providerProfileId ?? ""
    );
    const [orgUnitId, setOrgUnitId] = useState(caseData.orgUnitId ?? "");
    const [locationId, setLocationId] = useState(caseData.locationId ?? "");
    const [serviceTypeId, setServiceTypeId] = useState(
        caseData.serviceTypeId ?? ""
    );
    const [specialtyId, setSpecialtyId] = useState(caseData.specialtyId ?? "");
    const [notes, setNotes] = useState(caseData.notes ?? "");

    const [isPending, setIsPending] = useState(false);

    async function handleSaveMeta() {
        setIsPending(true);

        const result = await updatePreventiveCaseMetaAction({
            id: caseData.id,
            title,
            status,
            riskLevel: riskLevel || null,
            followUpFrequency: followUpFrequency || null,
            followUpIntervalDays: followUpIntervalDays
                ? Number(followUpIntervalDays)
                : null,
            nextFollowUpAt: nextFollowUpAt ? new Date(nextFollowUpAt) : null,
            pathologyId: pathologyId || null,
            providerProfileId: providerProfileId || null,
            orgUnitId: orgUnitId || null,
            locationId: locationId || null,
            serviceTypeId: serviceTypeId || null,
            specialtyId: specialtyId || null,
            notes,
        });

        setIsPending(false);

        if (!result.ok) {
            toast.error("Erreur", result.message);
            return;
        }

        toast.success("Succès", result.message);
        router.refresh();
    }

    async function handleComplete() {
        setIsPending(true);

        const result = await completePreventiveCaseAction({
            id: caseData.id,
        });

        setIsPending(false);

        if (!result.ok) {
            toast.error("Erreur", result.message);
            return;
        }

        toast.success("Succès", result.message);
        router.push(`/medical-record/health-promotion/cases/${caseData.id}`);
    }

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                Informations du dossier
                            </h2>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                {caseData.code} · {caseData.patientName}
                            </p>
                        </div>

                        <span className="w-fit rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300">
                            {statusLabel(caseData.status)}
                        </span>
                    </div>
                </div>

                <div className="grid gap-5 p-5 md:grid-cols-3">
                    <Field label="Titre">
                        <input
                            value={title}
                            disabled={disabled || isPending}
                            onChange={(event) => setTitle(event.target.value)}
                            className={inputClass}
                            placeholder="Suivi préventif – Hypertension"
                        />
                    </Field>

                    <Field label="Statut">
                        <select
                            value={status}
                            disabled={disabled || isPending}
                            onChange={(event) =>
                                setStatus(event.target.value as PreventiveCaseStatus)
                            }
                            className={inputClass}
                        >
                            {Object.values(PreventiveCaseStatus).map((item) => (
                                <option key={item} value={item}>
                                    {statusLabel(item)}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Niveau de risque">
                        <select
                            value={riskLevel}
                            disabled={disabled || isPending}
                            onChange={(event) => setRiskLevel(event.target.value)}
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

                    <Field label="Pathologie">
                        <select
                            value={pathologyId}
                            disabled={disabled || isPending}
                            onChange={(event) => setPathologyId(event.target.value)}
                            className={inputClass}
                        >
                            <option value="">Cas général</option>
                            {pathologies.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Professionnel responsable">
                        <select
                            value={providerProfileId}
                            disabled={disabled || isPending}
                            onChange={(event) => setProviderProfileId(event.target.value)}
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

                    <Field label="Fréquence de suivi">
                        <select
                            value={followUpFrequency}
                            disabled={disabled || isPending}
                            onChange={(event) => setFollowUpFrequency(event.target.value)}
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

                    <Field label="Intervalle personnalisé">
                        <input
                            type="number"
                            min={0}
                            value={followUpIntervalDays}
                            disabled={disabled || isPending}
                            onChange={(event) => setFollowUpIntervalDays(event.target.value)}
                            className={inputClass}
                            placeholder="90"
                        />
                    </Field>

                    <Field label="Prochain contrôle manuel">
                        <input
                            type="date"
                            value={nextFollowUpAt}
                            disabled={disabled || isPending}
                            onChange={(event) => setNextFollowUpAt(event.target.value)}
                            className={inputClass}
                        />
                    </Field>

                    <Field label="Type de service">
                        <select
                            value={serviceTypeId}
                            disabled={disabled || isPending}
                            onChange={(event) => setServiceTypeId(event.target.value)}
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

                    <Field label="Spécialité">
                        <select
                            value={specialtyId}
                            disabled={disabled || isPending}
                            onChange={(event) => setSpecialtyId(event.target.value)}
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

                    <Field label="Unité organisationnelle">
                        <select
                            value={orgUnitId}
                            disabled={disabled || isPending}
                            onChange={(event) => setOrgUnitId(event.target.value)}
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

                    <Field label="Lieu / site">
                        <select
                            value={locationId}
                            disabled={disabled || isPending}
                            onChange={(event) => setLocationId(event.target.value)}
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

                    <div className="space-y-2 md:col-span-3">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            Notes
                        </label>
                        <textarea
                            value={notes}
                            rows={4}
                            disabled={disabled || isPending}
                            onChange={(event) => setNotes(event.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>

                {!disabled && (
                    <div className="flex justify-end border-t border-slate-200 px-5 py-4 dark:border-slate-800">
                        <button
                            type="button"
                            disabled={isPending}
                            onClick={handleSaveMeta}
                            className="cursor-pointer rounded-lg bg-emerald-500/10 px-4 py-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-500/20 dark:text-emerald-300"
                        >
                            Enregistrer les informations
                        </button>
                    </div>
                )}
            </section>

            <div className="sticky bottom-0 z-10 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                    <button
                        type="button"
                        onClick={() =>
                            router.push(`/medical-record/suivi-cases/cases/${caseData.id}`)
                        }
                        className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        Retour
                    </button>

                    {!disabled && (
                        <button
                            type="button"
                            disabled={isPending}
                            onClick={handleComplete}
                            className="cursor-pointer rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                        >
                            Terminer le dossier
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {label}
            </label>
            {children}
        </div>
    );
}