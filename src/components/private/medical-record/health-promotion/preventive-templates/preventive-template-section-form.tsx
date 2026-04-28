"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiList, FiSave } from "react-icons/fi";
import { useToast } from "@/components/ui/toast/use-toast";
import type { PreventiveTemplateSectionFormValues } from "@/lib/types/health-promotion/preventive-template/preventive-template-section.types";
import { createPreventiveTemplateSectionAction } from "@/action/health-promotion/preventive-template/create-preventive-template-section-action";
import { updatePreventiveTemplateSectionAction } from "@/action/health-promotion/preventive-template/update-preventive-template-section-action";

type Props = {
    mode: "create" | "edit";
    templateId: string;
    versionId: string;
    sectionId?: string;
    templateName: string;
    versionNumber: number;
    initialValues?: PreventiveTemplateSectionFormValues;
};

type FormErrors = Partial<Record<keyof PreventiveTemplateSectionFormValues, string[]>>;

const DEFAULT_VALUES: PreventiveTemplateSectionFormValues = {
    key: "",
    title: "",
    order: 1,
};

export function PreventiveTemplateSectionForm({
    mode,
    templateId,
    versionId,
    sectionId,
    templateName,
    versionNumber,
    initialValues,
}: Props) {
    const router = useRouter();
    const toast = useToast();
    const [isPending, startTransition] = useTransition();

    const [values, setValues] = useState<PreventiveTemplateSectionFormValues>({
        ...DEFAULT_VALUES,
        ...initialValues,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [formError, setFormError] = useState("");

    const backPath = `/medical-record/health-promotion/templates/${templateId}/versions/${versionId}`;

    function setField<K extends keyof PreventiveTemplateSectionFormValues>(
        key: K,
        value: PreventiveTemplateSectionFormValues[K]
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
                key: values.key.trim(),
                title: values.title.trim(),
                order: Number(values.order),
            };

            const res =
                mode === "create"
                    ? await createPreventiveTemplateSectionAction(
                        templateId,
                        versionId,
                        payload
                    )
                    : await updatePreventiveTemplateSectionAction(
                        templateId,
                        versionId,
                        sectionId!,
                        payload
                    );

            if (!res.ok) {
                if ("errors" in res && res.errors) {
                    setErrors(res.errors as FormErrors);
                }

                setFormError(res.message || "Une erreur est survenue.");
                toast.error("Erreur", res.message || "Impossible d’enregistrer la section.");
                return;
            }

            toast.success(
                "Succès",
                mode === "create"
                    ? "La section a été créée avec succès."
                    : "La section a été mise à jour avec succès."
            );

            router.push(backPath);
            router.refresh();
        });
    }

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500/15 to-cyan-500/15 text-cyan-600 dark:text-cyan-300">
                            <FiList className="h-5 w-5" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                {mode === "create"
                                    ? "Nouvelle section"
                                    : "Modifier la section"}
                            </h1>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {templateName} · version {versionNumber}
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
                            <Label required>Clé</Label>
                            <input
                                type="text"
                                value={values.key}
                                onChange={(e) => setField("key", e.target.value)}
                                className={inputClass(Boolean(errors.key))}
                                placeholder="ex. antecedents"
                                disabled={isPending}
                            />
                            <ErrorText errors={errors.key} />
                        </Field>

                        <Field>
                            <Label required>Ordre</Label>
                            <input
                                type="number"
                                min={1}
                                value={values.order}
                                onChange={(e) => setField("order", Number(e.target.value))}
                                className={inputClass(Boolean(errors.order))}
                                disabled={isPending}
                            />
                            <ErrorText errors={errors.order} />
                        </Field>

                        <div className="md:col-span-2">
                            <Label required>Titre</Label>
                            <input
                                type="text"
                                value={values.title}
                                onChange={(e) => setField("title", e.target.value)}
                                className={inputClass(Boolean(errors.title))}
                                placeholder="ex. Antécédents médicaux"
                                disabled={isPending}
                            />
                            <ErrorText errors={errors.title} />
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => router.push(backPath)}
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
                                    ? "Créer la section"
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
                        <SummaryField label="Clé" value={values.key || "—"} />
                        <SummaryField label="Titre" value={values.title || "—"} />
                        <SummaryField label="Ordre" value={String(values.order || "—")} />
                    </div>
                </div>

                <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-5 dark:bg-cyan-500/10">
                    <h3 className="text-sm font-semibold text-cyan-800 dark:text-cyan-200">
                        Bon à savoir
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-cyan-700 dark:text-cyan-300">
                        Les sections permettent d’organiser les champs cliniques de la version.
                        Elles ne peuvent être modifiées que lorsque la version est en brouillon.
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