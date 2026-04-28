"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import { PartnerType } from "../../../../../generated/prisma/enums";
import { createPatientAction } from "@/action/patients/create-patient";
import { updatePatientAction } from "@/action/patients/update-patient";
import { getNextPatientCodeAction } from "@/action/patients/get-next-patient-code";
import { patientSchema } from "@/lib/zod/private/medical-record/patients/patient.schema";
import type {
    PatientActionState,
    PatientFormDefaults,
    PatientFormValues,
} from "@/lib/types/patients/patients.types";
import {
    patientDetailsPath,
    patientListPath,
} from "@/lib/types/patients/patients.routes";

type Props = {
    mode: "create" | "edit";
    defaultValues?: PatientFormDefaults;
};

const emptyDefaults: PatientFormDefaults = {
    type: PartnerType.PERSON,
    code: "",
    isActive: true,
    firstName: "",
    lastName: "",
    organizationName: "",
    email: "",
    phone: "",
    birthDate: "",
};

export function PatientForm({ mode, defaultValues }: Props) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    const initial = useMemo(
        () => ({ ...emptyDefaults, ...(defaultValues ?? {}) }),
        [defaultValues]
    );

    const [values, setValues] = useState<PatientFormValues>({
        type: initial.type,
        code: initial.code,
        isActive: initial.isActive,
        firstName: initial.firstName,
        lastName: initial.lastName,
        organizationName: initial.organizationName,
        email: initial.email,
        phone: initial.phone,
        birthDate: initial.birthDate,
    });

    const [formError, setFormError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({});

    const isPerson = values.type === PartnerType.PERSON;
    const isEdit = mode === "edit";

    const title = mode === "create" ? "Nouveau patient" : "Modifier le patient";
    const subtitle =
        mode === "create"
            ? "Créez un patient lié au module de médecine préventive."
            : "Mettez à jour les informations du patient.";

    useEffect(() => {
        if (mode !== "create") return;
        if ((values.code ?? "").trim() !== "") return;

        let mounted = true;

        async function loadSuggestedCode() {
            try {
                const code = await getNextPatientCodeAction();
                if (!mounted) return;

                setValues((prev) => {
                    if ((prev.code ?? "").trim() !== "") return prev;

                    return {
                        ...prev,
                        code,
                    };
                });
            } catch (error) {
                console.error("loadSuggestedCode", error);
            }
        }

        loadSuggestedCode();

        return () => {
            mounted = false;
        };
    }, [mode, values.code]);

    function setField<K extends keyof PatientFormValues>(
        key: K,
        value: PatientFormValues[K]
    ) {
        setValues((prev) => ({ ...prev, [key]: value }));
        setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
        setFormError(null);
    }

    function normalizeByType(input: PatientFormValues): PatientFormValues {
        if (input.type === PartnerType.PERSON) {
            return {
                ...input,
                organizationName: "",
            };
        }

        return {
            ...input,
            firstName: "",
            lastName: "",
            birthDate: "",
        };
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setFormError(null);

        const payload = normalizeByType(values);
        const clientParsed = patientSchema.safeParse(payload);

        if (!clientParsed.success) {
            const errors = clientParsed.error.flatten().fieldErrors;
            setFieldErrors(errors);
            setFormError("Veuillez corriger les champs du formulaire.");
            return;
        }

        startTransition(async () => {
            let res: PatientActionState;

            if (mode === "create") {
                res = await createPatientAction(payload);
            } else {
                const id = defaultValues?.id;
                if (!id) {
                    setFormError("Identifiant du patient introuvable.");
                    return;
                }
                res = await updatePatientAction(id, payload);
            }

            if (!res.ok) {
                setFormError(res.message);
                setFieldErrors(res.fieldErrors ?? {});
                return;
            }

            router.push(patientDetailsPath(res.id));
            router.refresh();
        });
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        {title}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {subtitle}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => router.push(patientListPath())}
                    className="inline-flex items-center gap-2 self-start rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                    <FiArrowLeft className="h-4 w-4" />
                    Retour
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <div className="xl:col-span-2 space-y-6">
                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                            <div className="mb-5">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    Informations générales
                                </h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Définissez le type de patient et ses informations principales.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <Field>
                                    <Label required>Type</Label>
                                    <select
                                        value={values.type}
                                        onChange={(e) => setField("type", e.target.value as PartnerType)}
                                        className={inputClass}
                                    >
                                        <option value={PartnerType.PERSON}>Personne</option>
                                        <option value={PartnerType.ORGANIZATION}>Organisation</option>
                                    </select>
                                    <FieldError error={fieldErrors.type?.[0]} />
                                </Field>

                                <Field>
                                    <Label>Code</Label>
                                    <input
                                        value={values.code ?? ""}
                                        onChange={(e) => {
                                            if (isEdit) return;
                                            setField("code", e.target.value);
                                        }}
                                        readOnly={true}
                                        className={[
                                            inputClass,
                                            isEdit
                                                ? "cursor-not-allowed bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400"
                                                : "cursor-not-allowed",
                                        ].join(" ")}
                                    />
                                    <Hint>
                                        {isEdit
                                            ? "Le code du patient est verrouillé et ne peut pas être modifié."
                                            : "Le code est chargé automatiquement et sera validé à l’enregistrement."}
                                    </Hint>
                                    <FieldError error={fieldErrors.code?.[0]} />
                                </Field>

                                {isPerson ? (
                                    <>
                                        <Field>
                                            <Label required>Prénom</Label>
                                            <input
                                                value={values.firstName ?? ""}
                                                onChange={(e) => setField("firstName", e.target.value)}
                                                placeholder="Jean"
                                                className={inputClass}
                                            />
                                            <FieldError error={fieldErrors.firstName?.[0]} />
                                        </Field>

                                        <Field>
                                            <Label required>Nom</Label>
                                            <input
                                                value={values.lastName ?? ""}
                                                onChange={(e) => setField("lastName", e.target.value)}
                                                placeholder="Dupont"
                                                className={inputClass}
                                            />
                                            <FieldError error={fieldErrors.lastName?.[0]} />
                                        </Field>

                                        <Field>
                                            <Label>Date de naissance</Label>
                                            <input
                                                type="date"
                                                value={values.birthDate ?? ""}
                                                onChange={(e) => setField("birthDate", e.target.value)}
                                                className={inputClass}
                                            />
                                            <FieldError error={fieldErrors.birthDate?.[0]} />
                                        </Field>
                                    </>
                                ) : (
                                    <Field className="md:col-span-2">
                                        <Label required>Nom de l’organisation</Label>
                                        <input
                                            value={values.organizationName ?? ""}
                                            onChange={(e) => setField("organizationName", e.target.value)}
                                            placeholder="Organisation patiente"
                                            className={inputClass}
                                        />
                                        <FieldError error={fieldErrors.organizationName?.[0]} />
                                    </Field>
                                )}

                                <Field>
                                    <Label>E-mail</Label>
                                    <input
                                        type="email"
                                        value={values.email ?? ""}
                                        onChange={(e) => setField("email", e.target.value)}
                                        placeholder="patient@clinic.be"
                                        className={inputClass}
                                    />
                                    <FieldError error={fieldErrors.email?.[0]} />
                                </Field>

                                <Field>
                                    <Label>Téléphone</Label>
                                    <input
                                        value={values.phone ?? ""}
                                        onChange={(e) => setField("phone", e.target.value)}
                                        placeholder="+32 4 00 00 00 00"
                                        className={inputClass}
                                    />
                                    <FieldError error={fieldErrors.phone?.[0]} />
                                </Field>
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6">
                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                Statut
                            </h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Activez ou désactivez ce patient.
                            </p>

                            <label className="mt-5 flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                        Patient actif
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Le patient pourra être utilisé dans le module médical.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setField("isActive", !(values.isActive ?? true))}
                                    className={[
                                        "relative inline-flex h-7 w-12 items-center rounded-full transition",
                                        values.isActive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700",
                                    ].join(" ")}
                                >
                                    <span
                                        className={[
                                            "inline-block h-5 w-5 transform rounded-full bg-white transition",
                                            values.isActive ? "translate-x-6" : "translate-x-1",
                                        ].join(" ")}
                                    />
                                </button>
                            </label>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                Résumé
                            </h2>

                            <div className="mt-4 space-y-3 text-sm">
                                <SummaryRow
                                    label="Type"
                                    value={values.type === PartnerType.PERSON ? "Personne" : "Organisation"}
                                />
                                <SummaryRow
                                    label="Nom affiché"
                                    value={
                                        values.type === PartnerType.PERSON
                                            ? [values.firstName, values.lastName].filter(Boolean).join(" ") || "—"
                                            : values.organizationName || "—"
                                    }
                                />
                                <SummaryRow label="Code" value={values.code || "—"} />
                                <SummaryRow label="E-mail" value={values.email || "—"} />
                                <SummaryRow label="Téléphone" value={values.phone || "—"} />
                                <SummaryRow label="Rôle système" value="Patient" />
                            </div>
                        </section>

                        <section className="rounded-3xl border border-emerald-500/20 bg-linear-to-br from-emerald-500/5 to-cyan-500/5 p-6">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                Vérification
                            </p>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                Ce module crée automatiquement le patient avec le rôle système requis.
                            </p>
                        </section>
                    </div>
                </div>

                {formError ? (
                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">
                        {formError}
                    </div>
                ) : null}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={() => router.push(patientListPath())}
                        className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                    >
                        Annuler
                    </button>

                    <button
                        type="submit"
                        disabled={pending}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {pending ? (
                            <>Enregistrement...</>
                        ) : (
                            <>
                                <FiSave className="h-4 w-4" />
                                {mode === "create"
                                    ? "Créer le patient"
                                    : "Enregistrer les modifications"}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

const inputClass =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500";

function Field({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return <div className={className}>{children}</div>;
}

function Label({
    children,
    required = false,
}: {
    children: React.ReactNode;
    required?: boolean;
}) {
    return (
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
            {children}
            {required ? <span className="ml-1 text-rose-500">*</span> : null}
        </label>
    );
}

function Hint({ children }: { children: React.ReactNode }) {
    return (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {children}
        </p>
    );
}

function FieldError({
    error,
    className = "",
}: {
    error?: string;
    className?: string;
}) {
    if (!error) return null;

    return (
        <p className={`mt-2 text-xs font-medium text-rose-600 dark:text-rose-400 ${className}`}>
            {error}
        </p>
    );
}

function SummaryRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-slate-500 dark:text-slate-400">{label}</span>
            <span className="max-w-[60%] truncate font-medium text-slate-900 dark:text-slate-100">
                {value}
            </span>
        </div>
    );
}