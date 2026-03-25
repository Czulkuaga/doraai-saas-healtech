"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiSave, FiStar, FiUserCheck } from "react-icons/fi";
import { PATIENT_PROVIDER_ASSIGNMENT_TYPE_OPTIONS } from "@/lib/types/patient-provider-assignment/patient-provider-assignment.catalog";
import type { PatientProviderAssignmentFormValues } from "@/lib/types/patient-provider-assignment/patient-provider-assignment.types";
import { createPatientProviderAssignmentAction } from "@/action/patient-provider-assignment/create-patient-provider-assignment-action";
import { updatePatientProviderAssignmentAction } from "@/action/patient-provider-assignment/update-patient-provider-assignment-action";
import { useToast } from "@/components/ui/toast/use-toast";


type Option = {
    value: string;
    label: string;
    licenseNumber?: string | null;
};

type Props = {
    mode: "create" | "edit";
    assignmentId?: string;
    initialValues?: PatientProviderAssignmentFormValues;
    patientOptions: Option[];
    providerOptions: Option[];
};

type FormErrors = Partial<Record<keyof PatientProviderAssignmentFormValues, string[]>>;

const DEFAULT_VALUES: PatientProviderAssignmentFormValues = {
    patientId: "",
    providerProfileId: "",
    assignmentType: "PREVENTIVE_FOLLOWUP",
    isPrimary: false,
    isActive: true,
    startDate: "",
    endDate: "",
    notes: "",
};

export function PatientProviderAssignmentForm({
    mode,
    assignmentId,
    initialValues,
    patientOptions,
    providerOptions,
}: Props) {
    const router = useRouter();
    const toast = useToast();
    const [isPending, startTransition] = useTransition();

    const [values, setValues] = useState<PatientProviderAssignmentFormValues>({
        ...DEFAULT_VALUES,
        ...initialValues,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [formError, setFormError] = useState<string>("");

    const selectedPatient = useMemo(
        () => patientOptions.find((item) => item.value === values.patientId) ?? null,
        [patientOptions, values.patientId]
    );

    const selectedProvider = useMemo(
        () => providerOptions.find((item) => item.value === values.providerProfileId) ?? null,
        [providerOptions, values.providerProfileId]
    );

    function setField<K extends keyof PatientProviderAssignmentFormValues>(
        key: K,
        value: PatientProviderAssignmentFormValues[K]
    ) {
        setValues((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: undefined }));
        setFormError("");
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setFormError("");
        setErrors({});

        startTransition(async () => {
            const payload = {
                patientId: values.patientId,
                providerProfileId: values.providerProfileId,
                assignmentType: values.assignmentType,
                isPrimary: values.isPrimary,
                isActive: values.isActive,
                startDate: values.startDate || null,
                endDate: values.endDate || null,
                notes: values.notes?.trim() || null,
            };

            const res =
                mode === "create"
                    ? await createPatientProviderAssignmentAction(payload)
                    : await updatePatientProviderAssignmentAction(assignmentId!, payload);

            if (!res.ok) {
                if ("errors" in res && res.errors) {
                    setErrors(res.errors as FormErrors);
                }

                setFormError(res.message || "Une erreur est survenue.");
                toast.error("Erreur", res.message || "Impossible d’enregistrer l’affectation.");
                return;
            }

            toast.success(
                "Succès",
                mode === "create"
                    ? "L’affectation a été créée avec succès."
                    : "L’affectation a été mise à jour avec succès."
            );

            router.push("/organization/patient-assignments");
            router.refresh();
        });
    }

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500/15 to-cyan-500/15 text-cyan-600 dark:text-cyan-300">
                            <FiUserCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                {mode === "create"
                                    ? "Nouvelle affectation"
                                    : "Modifier l’affectation"}
                            </h1>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Définissez le lien entre un patient et un professionnel.
                            </p>
                        </div>
                    </div>

                    {formError ? (
                        <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                            {formError}
                        </div>
                    ) : null}

                    <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                        <Field>
                            <Label required>Patient</Label>
                            <select
                                value={values.patientId}
                                onChange={(e) => setField("patientId", e.target.value)}
                                className={inputClass(Boolean(errors.patientId))}
                                disabled={isPending}
                            >
                                <option value="">Sélectionner un patient</option>
                                {patientOptions.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                            <ErrorText errors={errors.patientId} />
                        </Field>

                        <Field>
                            <Label required>Professionnel</Label>
                            <select
                                value={values.providerProfileId}
                                onChange={(e) => setField("providerProfileId", e.target.value)}
                                className={inputClass(Boolean(errors.providerProfileId))}
                                disabled={isPending}
                            >
                                <option value="">Sélectionner un professionnel</option>
                                {providerOptions.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                            <ErrorText errors={errors.providerProfileId} />
                        </Field>

                        <Field>
                            <Label required>Type d’affectation</Label>
                            <select
                                value={values.assignmentType}
                                onChange={(e) =>
                                    setField(
                                        "assignmentType",
                                        e.target.value as PatientProviderAssignmentFormValues["assignmentType"]
                                    )
                                }
                                className={inputClass(Boolean(errors.assignmentType))}
                                disabled={isPending}
                            >
                                {PATIENT_PROVIDER_ASSIGNMENT_TYPE_OPTIONS.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.labelFr}
                                    </option>
                                ))}
                            </select>
                            <ErrorText errors={errors.assignmentType} />
                        </Field>

                        <Field>
                            <Label>Date de début</Label>
                            <input
                                type="date"
                                value={values.startDate ?? ""}
                                onChange={(e) => setField("startDate", e.target.value)}
                                className={inputClass(Boolean(errors.startDate))}
                                disabled={isPending}
                            />
                            <ErrorText errors={errors.startDate} />
                        </Field>

                        <Field>
                            <Label>Date de fin</Label>
                            <input
                                type="date"
                                value={values.endDate ?? ""}
                                onChange={(e) => setField("endDate", e.target.value)}
                                className={inputClass(Boolean(errors.endDate))}
                                disabled={isPending}
                            />
                            <ErrorText errors={errors.endDate} />
                        </Field>

                        <div className="md:col-span-2">
                            <Label>Notes</Label>
                            <textarea
                                value={values.notes ?? ""}
                                onChange={(e) => setField("notes", e.target.value)}
                                rows={5}
                                className={textareaClass(Boolean(errors.notes))}
                                placeholder="Notes complémentaires sur l’affectation..."
                                disabled={isPending}
                            />
                            <ErrorText errors={errors.notes} />
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                            <input
                                type="checkbox"
                                checked={values.isPrimary}
                                onChange={(e) => setField("isPrimary", e.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                                disabled={isPending}
                            />
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    Affectation principale
                                </p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    Cette affectation sera considérée comme la relation principale active du patient.
                                </p>
                            </div>
                        </label>

                        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                            <input
                                type="checkbox"
                                checked={values.isActive}
                                onChange={(e) => setField("isActive", e.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                                disabled={isPending}
                            />
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    Affectation active
                                </p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    Décochez cette option si la relation est terminée ou inactive.
                                </p>
                            </div>
                        </label>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => router.push("/organization/patient-assignments")}
                            className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                            disabled={isPending}
                        >
                            <FiArrowLeft className="h-4 w-4" />
                            Retour
                        </button>

                        <button
                            type="submit"
                            className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-emerald-400 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isPending}
                        >
                            <FiSave className="h-4 w-4" />
                            {isPending
                                ? "Enregistrement..."
                                : mode === "create"
                                    ? "Créer l’affectation"
                                    : "Enregistrer les modifications"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-6 xl:col-span-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center gap-2">
                        <FiStar className="h-4 w-4 text-amber-500" />
                        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            Résumé
                        </h2>
                    </div>

                    <div className="mt-5 space-y-4">
                        <SummaryField
                            label="Patient"
                            value={selectedPatient?.label || "Non sélectionné"}
                        />
                        <SummaryField
                            label="Professionnel"
                            value={selectedProvider?.label || "Non sélectionné"}
                        />
                        <SummaryField
                            label="Licence"
                            value={selectedProvider?.licenseNumber || "—"}
                        />
                        <SummaryField
                            label="Type"
                            value={
                                PATIENT_PROVIDER_ASSIGNMENT_TYPE_OPTIONS.find(
                                    (item) => item.value === values.assignmentType
                                )?.labelFr || "—"
                            }
                        />
                        <SummaryField
                            label="Principal"
                            value={values.isPrimary ? "Oui" : "Non"}
                        />
                        <SummaryField
                            label="Statut"
                            value={values.isActive ? "Actif" : "Inactif"}
                        />
                    </div>
                </div>

                <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-5 dark:bg-cyan-500/10">
                    <h3 className="text-sm font-semibold text-cyan-800 dark:text-cyan-200">
                        Bon à savoir
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-cyan-700 dark:text-cyan-300">
                        Si vous marquez cette affectation comme principale et active, les autres
                        affectations principales actives du même patient seront automatiquement
                        désactivées comme principales.
                    </p>
                </div>
            </div>
        </form>
    );
}

function Field({ children }: { children: React.ReactNode }) {
    return <div className="space-y-2">{children}</div>;
}

function Label({
    children,
    required = false,
}: {
    children: React.ReactNode;
    required?: boolean;
}) {
    return (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {children}
            {required ? <span className="ml-1 text-rose-500">*</span> : null}
        </label>
    );
}

function ErrorText({ errors }: { errors?: string[] }) {
    if (!errors?.length) return null;

    return <p className="text-sm text-rose-600 dark:text-rose-300">{errors[0]}</p>;
}

function SummaryField({ label, value }: { label: string; value: string }) {
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

function inputClass(hasError: boolean) {
    return [
        "w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition dark:bg-slate-950 dark:text-slate-100",
        hasError
            ? "border-rose-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 dark:border-rose-500"
            : "border-slate-200 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-800",
    ].join(" ");
}

function textareaClass(hasError: boolean) {
    return [
        "w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition dark:bg-slate-950 dark:text-slate-100",
        hasError
            ? "border-rose-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 dark:border-rose-500"
            : "border-slate-200 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-800",
    ].join(" ");
}