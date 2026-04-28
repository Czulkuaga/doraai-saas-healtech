"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiLayers, FiSave } from "react-icons/fi";
import { useToast } from "@/components/ui/toast/use-toast";
import { PREVENTIVE_TEMPLATE_STATUS_OPTIONS } from "@/lib/types/health-promotion/preventive-template/preventive-template.catalog";
import type {
    PreventiveTemplateFormOption,
    PreventiveTemplateFormValues,
} from "@/lib/types/health-promotion/preventive-template/preventive-template.form.types";
import { createPreventiveTemplateAction } from "@/action/health-promotion/preventive-template/create-preventive-template-action";
import { updatePreventiveTemplateAction } from "@/action/health-promotion/preventive-template/update-preventive-template-action";

type Props = {
    mode: "create" | "edit";
    templateId?: string;
    initialValues?: PreventiveTemplateFormValues;
    serviceTypeOptions: PreventiveTemplateFormOption[];
    specialtyOptions: PreventiveTemplateFormOption[];
};

type FormErrors = Partial<Record<keyof PreventiveTemplateFormValues, string[]>>;

const DEFAULT_VALUES: PreventiveTemplateFormValues = {
    code: "",
    name: "",
    description: "",
    serviceTypeId: "",
    specialtyId: "",
    status: "DRAFT",
    isActive: true,
};

export function PreventiveTemplateForm({
    mode,
    templateId,
    initialValues,
    serviceTypeOptions,
    specialtyOptions,
}: Props) {
    const router = useRouter();
    const toast = useToast();
    const [isPending, startTransition] = useTransition();

    const [values, setValues] = useState<PreventiveTemplateFormValues>({
        ...DEFAULT_VALUES,
        ...initialValues,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [formError, setFormError] = useState("");

    function setField<K extends keyof PreventiveTemplateFormValues>(
        key: K,
        value: PreventiveTemplateFormValues[K]
    ) {
        setValues((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: undefined }));
        setFormError("");
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setErrors({});
        setFormError("");

        startTransition(async () => {
            const payload = {
                code: values.code.trim(),
                name: values.name.trim(),
                description: values.description?.trim() || null,
                serviceTypeId: values.serviceTypeId || null,
                specialtyId: values.specialtyId || null,
                status: values.status,
                isActive: values.isActive,
            };

            const res =
                mode === "create"
                    ? await createPreventiveTemplateAction(payload)
                    : await updatePreventiveTemplateAction(templateId!, payload);

            if (!res.ok) {
                if ("errors" in res && res.errors) {
                    setErrors(res.errors as FormErrors);
                }

                setFormError(res.message || "Une erreur est survenue.");
                toast.error("Erreur", res.message || "Impossible d’enregistrer le modèle.");
                return;
            }

            toast.success(
                "Succès",
                mode === "create"
                    ? "Le modèle a été créé avec succès."
                    : "Le modèle a été mis à jour avec succès."
            );

            router.push("/medical-record/health-promotion/templates");
            router.refresh();
        });
    }

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500/15 to-cyan-500/15 text-cyan-600 dark:text-cyan-300">
                            <FiLayers className="h-5 w-5" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                {mode === "create"
                                    ? "Nouveau modèle préventif"
                                    : "Modifier le modèle préventif"}
                            </h1>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Définissez les métadonnées de base du modèle avant de gérer ses versions et sa structure.
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
                            <Label required>Code</Label>
                            <input
                                type="text"
                                value={values.code}
                                onChange={(e) => setField("code", e.target.value)}
                                className={inputClass(Boolean(errors.code))}
                                placeholder="Ex. PREV-CARDIO-001"
                                disabled={isPending}
                            />
                            <ErrorText errors={errors.code} />
                        </Field>

                        <Field>
                            <Label required>Nom</Label>
                            <input
                                type="text"
                                value={values.name}
                                onChange={(e) => setField("name", e.target.value)}
                                className={inputClass(Boolean(errors.name))}
                                placeholder="Ex. Bilan cardiovasculaire initial"
                                disabled={isPending}
                            />
                            <ErrorText errors={errors.name} />
                        </Field>

                        {/* <div className="md:col-span-2">
                            <Label>Description</Label>
                            <textarea
                                value={values.description ?? ""}
                                onChange={(e) => setField("description", e.target.value)}
                                rows={5}
                                className={textareaClass(Boolean(errors.description))}
                                placeholder="Décrivez brièvement l’objectif du modèle..."
                                disabled={isPending}
                            />
                            <ErrorText errors={errors.description} />
                        </div> */}

                        <Field>
                            <Label>Type de service</Label>
                            <select
                                value={values.serviceTypeId ?? ""}
                                onChange={(e) => setField("serviceTypeId", e.target.value)}
                                className={inputClass(Boolean(errors.serviceTypeId))}
                                disabled={isPending}
                            >
                                <option value="">Aucun</option>
                                {serviceTypeOptions.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                            <ErrorText errors={errors.serviceTypeId} />
                        </Field>

                        <Field>
                            <Label>Spécialité</Label>
                            <select
                                value={values.specialtyId ?? ""}
                                onChange={(e) => setField("specialtyId", e.target.value)}
                                className={inputClass(Boolean(errors.specialtyId))}
                                disabled={isPending}
                            >
                                <option value="">Aucune</option>
                                {specialtyOptions.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                            <ErrorText errors={errors.specialtyId} />
                        </Field>

                        <Field>
                            <Label required>Statut</Label>
                            <select
                                value={values.status}
                                onChange={(e) =>
                                    setField(
                                        "status",
                                        e.target.value as PreventiveTemplateFormValues["status"]
                                    )
                                }
                                className={inputClass(Boolean(errors.status))}
                                disabled={isPending}
                            >
                                {PREVENTIVE_TEMPLATE_STATUS_OPTIONS.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.labelFr}
                                    </option>
                                ))}
                            </select>
                            <ErrorText errors={errors.status} />
                        </Field>

                        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40 md:col-span-2">
                            <input
                                type="checkbox"
                                checked={values.isActive}
                                onChange={(e) => setField("isActive", e.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                                disabled={isPending}
                            />
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    Modèle actif
                                </p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    Décochez cette option si le modèle ne doit plus être proposé dans le module.
                                </p>
                            </div>
                        </label>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => router.push("/medical-record/health-promotion/templates")}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                            disabled={isPending}
                        >
                            <FiArrowLeft className="h-4 w-4" />
                            Retour
                        </button>

                        <button
                            type="submit"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-emerald-400 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isPending}
                        >
                            <FiSave className="h-4 w-4" />
                            {isPending
                                ? "Enregistrement..."
                                : mode === "create"
                                    ? "Créer le modèle"
                                    : "Enregistrer les modifications"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-6 xl:col-span-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Résumé
                    </h2>

                    <div className="mt-5 space-y-4">
                        <SummaryField label="Code" value={values.code || "—"} />
                        <SummaryField label="Nom" value={values.name || "—"} />
                        <SummaryField
                            label="Type de service"
                            value={
                                serviceTypeOptions.find((item) => item.value === values.serviceTypeId)
                                    ?.label || "—"
                            }
                        />
                        <SummaryField
                            label="Spécialité"
                            value={
                                specialtyOptions.find((item) => item.value === values.specialtyId)
                                    ?.label || "—"
                            }
                        />
                        <SummaryField
                            label="Statut"
                            value={
                                PREVENTIVE_TEMPLATE_STATUS_OPTIONS.find(
                                    (item) => item.value === values.status
                                )?.labelFr || "—"
                            }
                        />
                        <SummaryField
                            label="Actif"
                            value={values.isActive ? "Oui" : "Non"}
                        />
                    </div>
                </div>

                <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-5 dark:bg-cyan-500/10">
                    <h3 className="text-sm font-semibold text-cyan-800 dark:text-cyan-200">
                        Bon à savoir
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-cyan-700 dark:text-cyan-300">
                        Lors de la création du modèle, une première version brouillon sera générée automatiquement afin de préparer la structure clinique.
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