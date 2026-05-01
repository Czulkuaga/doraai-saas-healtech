// src/components/private/medical-record/health-promotion/cases/preventive-case-edit-form.tsx

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    PreventiveCaseStatus,
    PreventiveFieldType,
} from "../../../../../../generated/prisma/enums";
import {
    completePreventiveCaseAction,
    savePreventiveCaseAnswersAction,
    updatePreventiveCaseMetaAction,
} from "@/action/health-promotion/case/preventive-case.actions";
import { useToast } from "@/components/ui/toast/use-toast";

type Option = {
    id: string;
    name: string;
};

type FieldOption = {
    id: string;
    key: string;
    label: string;
    order: number;
};

type Field = {
    id: string;
    key: string;
    label: string;
    type: PreventiveFieldType;
    required: boolean;
    order: number;
    config: unknown;
    options: FieldOption[];
};

type Section = {
    id: string;
    key: string;
    title: string;
    order: number;
    fields: Field[];
};

type ExistingValue = {
    fieldId: string;
    valueString: string | null;
    valueNumber: string | null;
    valueBoolean: boolean | null;
    valueDate: Date | null;
    valueDateTime: Date | null;
    valueJson: unknown;
    optionId: string | null;
    optionIds: string[];
};

type CaseData = {
    id: string;
    code: string;
    status: PreventiveCaseStatus;
    notes: string | null;
    providerProfileId: string | null;
    orgUnitId: string | null;
    locationId: string | null;
    templateName: string;
    patientName: string;
    sections: Section[];
    values: ExistingValue[];
};

type Props = {
    caseData: CaseData;
    providers: Option[];
    orgUnits: Option[];
    locations: Option[];
};

function dateToInputValue(date: Date | null) {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 10);
}

function dateTimeToInputValue(date: Date | null) {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 16);
}

function getInitialAnswer(value: ExistingValue | undefined, field: Field) {
    if (!value) {
        if (field.type === PreventiveFieldType.MULTI_SELECT) return [];
        if (field.type === PreventiveFieldType.BOOLEAN) return "";
        return "";
    }

    switch (field.type) {
        case PreventiveFieldType.TEXT:
        case PreventiveFieldType.TEXTAREA:
            return value.valueString ?? "";

        case PreventiveFieldType.NUMBER:
            return value.valueNumber ?? "";

        case PreventiveFieldType.BOOLEAN:
            return value.valueBoolean === null ? "" : String(value.valueBoolean);

        case PreventiveFieldType.DATE:
            return dateToInputValue(value.valueDate);

        case PreventiveFieldType.DATETIME:
            return dateTimeToInputValue(value.valueDateTime);

        case PreventiveFieldType.SINGLE_SELECT:
            return value.optionId ?? "";

        case PreventiveFieldType.MULTI_SELECT:
            return value.optionIds ?? [];

        case PreventiveFieldType.FILE:
        case PreventiveFieldType.JSON:
            return value.valueJson ? JSON.stringify(value.valueJson, null, 2) : "";

        default:
            return "";
    }
}

function statusLabel(status: PreventiveCaseStatus) {
    switch (status) {
        case PreventiveCaseStatus.OPEN:
            return "Ouvert";
        case PreventiveCaseStatus.IN_PROGRESS:
            return "En cours";
        case PreventiveCaseStatus.COMPLETED:
            return "Complété";
        case PreventiveCaseStatus.CANCELLED:
            return "Annulé";
        default:
            return status;
    }
}

function normalizeFieldErrors(
    errors: unknown
): Record<string, string> {
    if (!errors || typeof errors !== "object") return {};

    const result: Record<string, string> = {};

    Object.entries(errors).forEach(([key, value]) => {
        if (typeof value === "string") {
            result[key] = value;
            return;
        }

        if (Array.isArray(value) && typeof value[0] === "string") {
            result[key] = value[0];
        }
    });

    return result;
}

export function PreventiveCaseEditForm({
    caseData,
    providers,
    orgUnits,
    locations,
}: Props) {
    const router = useRouter();
    const toast = useToast();

    const disabled =
        caseData.status === PreventiveCaseStatus.COMPLETED ||
        caseData.status === PreventiveCaseStatus.CANCELLED;

    const [providerProfileId, setProviderProfileId] = useState(
        caseData.providerProfileId ?? ""
    );
    const [orgUnitId, setOrgUnitId] = useState(caseData.orgUnitId ?? "");
    const [locationId, setLocationId] = useState(caseData.locationId ?? "");
    const [notes, setNotes] = useState(caseData.notes ?? "");
    const [isPending, setIsPending] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const initialAnswers = useMemo(() => {
        const valuesByFieldId = new Map(
            caseData.values.map((value) => [value.fieldId, value])
        );

        const result: Record<string, unknown> = {};

        for (const section of caseData.sections) {
            for (const field of section.fields) {
                result[field.id] = getInitialAnswer(
                    valuesByFieldId.get(field.id),
                    field
                );
            }
        }

        return result;
    }, [caseData.sections, caseData.values]);

    const [answers, setAnswers] = useState<Record<string, unknown>>(initialAnswers);

    function updateAnswer(fieldId: string, value: unknown) {
        setAnswers((prev) => ({
            ...prev,
            [fieldId]: value,
        }));
    }

    async function handleSaveMeta() {
        setIsPending(true);

        const result = await updatePreventiveCaseMetaAction({
            id: caseData.id,
            providerProfileId,
            orgUnitId,
            locationId,
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

    async function handleSaveAnswers() {
        setIsPending(true);
        setFieldErrors({});

        const result = await savePreventiveCaseAnswersAction({
            caseId: caseData.id,
            answers,
        });

        setIsPending(false);

        if (!result.ok) {
            if ("fieldErrors" in result && result.fieldErrors) {
                setFieldErrors(normalizeFieldErrors(result.fieldErrors));
            }

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

    function renderField(field: Field) {
        const baseClass =
            "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

        const value = answers[field.id];

        switch (field.type) {
            case PreventiveFieldType.TEXT:
                return (
                    <input
                        value={String(value ?? "")}
                        disabled={disabled || isPending}
                        onChange={(event) => updateAnswer(field.id, event.target.value)}
                        className={baseClass}
                    />
                );

            case PreventiveFieldType.TEXTAREA:
                return (
                    <textarea
                        value={String(value ?? "")}
                        disabled={disabled || isPending}
                        rows={4}
                        onChange={(event) => updateAnswer(field.id, event.target.value)}
                        className={baseClass}
                    />
                );

            case PreventiveFieldType.NUMBER:
                return (
                    <input
                        type="number"
                        value={String(value ?? "")}
                        disabled={disabled || isPending}
                        onChange={(event) => updateAnswer(field.id, event.target.value)}
                        className={baseClass}
                    />
                );

            case PreventiveFieldType.BOOLEAN:
                return (
                    <select
                        value={String(value ?? "")}
                        disabled={disabled || isPending}
                        onChange={(event) => updateAnswer(field.id, event.target.value)}
                        className={baseClass}
                    >
                        <option value="">Sélectionner...</option>
                        <option value="true">Oui</option>
                        <option value="false">Non</option>
                    </select>
                );

            case PreventiveFieldType.DATE:
                return (
                    <input
                        type="date"
                        value={String(value ?? "")}
                        disabled={disabled || isPending}
                        onChange={(event) => updateAnswer(field.id, event.target.value)}
                        className={baseClass}
                    />
                );

            case PreventiveFieldType.DATETIME:
                return (
                    <input
                        type="datetime-local"
                        value={String(value ?? "")}
                        disabled={disabled || isPending}
                        onChange={(event) => updateAnswer(field.id, event.target.value)}
                        className={baseClass}
                    />
                );

            case PreventiveFieldType.SINGLE_SELECT:
                return (
                    <select
                        value={String(value ?? "")}
                        disabled={disabled || isPending}
                        onChange={(event) => updateAnswer(field.id, event.target.value)}
                        className={baseClass}
                    >
                        <option value="">Sélectionner...</option>
                        {field.options.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case PreventiveFieldType.MULTI_SELECT:
                return (
                    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                        {field.options.map((option) => {
                            const selected = Array.isArray(value)
                                ? value.includes(option.id)
                                : false;

                            return (
                                <label
                                    key={option.id}
                                    className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selected}
                                        disabled={disabled || isPending}
                                        onChange={(event) => {
                                            const current = Array.isArray(value)
                                                ? value.filter(
                                                    (item): item is string =>
                                                        typeof item === "string"
                                                )
                                                : [];

                                            updateAnswer(
                                                field.id,
                                                event.target.checked
                                                    ? [...current, option.id]
                                                    : current.filter(
                                                        (id) => id !== option.id
                                                    )
                                            );
                                        }}
                                    />
                                    {option.label}
                                </label>
                            );
                        })}
                    </div>
                );

            case PreventiveFieldType.FILE:
                return (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                        Le champ fichier n’est pas encore disponible dans cette version.
                    </div>
                );
            case PreventiveFieldType.JSON:
                return (
                    <textarea
                        value={String(value ?? "")}
                        disabled={disabled || isPending}
                        rows={5}
                        onChange={(event) => updateAnswer(field.id, event.target.value)}
                        className={`${baseClass} font-mono`}
                    />
                );

            default:
                return null;
        }
    }

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                Informations du cas
                            </h2>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                {caseData.templateName} · {caseData.patientName}
                            </p>
                        </div>

                        <span className="w-fit rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300">
                            {statusLabel(caseData.status)}
                        </span>
                    </div>
                </div>

                <div className="grid gap-5 p-5 md:grid-cols-3">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            Professionnel
                        </label>
                        <select
                            value={providerProfileId}
                            disabled={disabled || isPending}
                            onChange={(event) => setProviderProfileId(event.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        >
                            <option value="">Non assigné</option>
                            {providers.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            Unité organisationnelle
                        </label>
                        <select
                            value={orgUnitId}
                            disabled={disabled || isPending}
                            onChange={(event) => setOrgUnitId(event.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        >
                            <option value="">Non assignée</option>
                            {orgUnits.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            Lieu / site
                        </label>
                        <select
                            value={locationId}
                            disabled={disabled || isPending}
                            onChange={(event) => setLocationId(event.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        >
                            <option value="">Non assigné</option>
                            {locations.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2 md:col-span-3">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            Notes
                        </label>
                        <textarea
                            value={notes}
                            rows={4}
                            disabled={disabled || isPending}
                            onChange={(event) => setNotes(event.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                    </div>
                </div>

                {!disabled && (
                    <div className="flex justify-end border-t border-slate-200 px-5 py-4 dark:border-slate-800">
                        <button
                            type="button"
                            disabled={isPending}
                            onClick={handleSaveMeta}
                            className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                        >
                            Enregistrer les informations
                        </button>
                    </div>
                )}
            </section>

            {caseData.sections.map((section) => (
                <section
                    key={section.id}
                    className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
                >
                    <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            {section.title}
                        </h2>
                    </div>

                    <div className="grid gap-5 p-5 md:grid-cols-2">
                        {section.fields.map((field) => (
                            <div key={field.id} className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    {field.label}
                                    {field.required && (
                                        <span className="ml-1 text-rose-500">*</span>
                                    )}
                                </label>

                                {renderField(field)}

                                {fieldErrors[field.id] && (
                                    <p className="text-xs text-rose-600 dark:text-rose-400">
                                        {fieldErrors[field.id]}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            ))}

            <div className="sticky bottom-0 z-10 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                    <button
                        type="button"
                        onClick={() => router.push("/medical-record/health-promotion/cases")}
                        className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        Retour
                    </button>

                    {!disabled && (
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={handleSaveAnswers}
                                className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                            >
                                Enregistrer les réponses
                            </button>

                            <button
                                type="button"
                                disabled={isPending}
                                onClick={handleComplete}
                                className="cursor-pointer rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                            >
                                Compléter le cas
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}