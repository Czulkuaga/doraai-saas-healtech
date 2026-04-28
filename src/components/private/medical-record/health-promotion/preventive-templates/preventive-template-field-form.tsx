"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiSave, FiType } from "react-icons/fi";
import { useToast } from "@/components/ui/toast/use-toast";
import type { PreventiveFieldType } from "../../../../../../generated/prisma/enums";
import type { PreventiveTemplateFieldFormValues } from "@/lib/types/health-promotion/preventive-template/preventive-template-field.types";
import { createPreventiveTemplateFieldAction } from "@/action/health-promotion/preventive-template/create-preventive-template-field-action";
import { updatePreventiveTemplateFieldAction } from "@/action/health-promotion/preventive-template/update-preventive-template-field-action";

type Props = {
    mode: "create" | "edit";
    templateId: string;
    versionId: string;
    sectionId: string;
    fieldId?: string;
    templateName: string;
    versionNumber: number;
    sectionTitle: string;
    fieldTypeOptions: Array<{
        value: PreventiveFieldType;
        label: string;
    }>;
    initialValues?: PreventiveTemplateFieldFormValues;
};

type FormErrors = Partial<Record<keyof PreventiveTemplateFieldFormValues, string[]>>;

export function PreventiveTemplateFieldForm({
    mode,
    templateId,
    versionId,
    sectionId,
    fieldId,
    templateName,
    versionNumber,
    sectionTitle,
    fieldTypeOptions,
    initialValues,
}: Props) {
    const router = useRouter();
    const toast = useToast();
    const [isPending, startTransition] = useTransition();

    const defaultType = fieldTypeOptions[0]?.value;

    const [values, setValues] = useState<PreventiveTemplateFieldFormValues>({
        key: "",
        label: "",
        type: defaultType,
        required: false,
        order: 1,
        configText: "",
        ...initialValues,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [formError, setFormError] = useState("");

    const backPath = `/medical-record/health-promotion/templates/${templateId}/versions/${versionId}/sections/${sectionId}`;

    function setField<K extends keyof PreventiveTemplateFieldFormValues>(
        key: K,
        value: PreventiveTemplateFieldFormValues[K]
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
                label: values.label.trim(),
                type: values.type,
                required: values.required,
                order: Number(values.order),
                configText: values.configText?.trim() || null,
            };

            const res =
                mode === "create"
                    ? await createPreventiveTemplateFieldAction(
                          templateId,
                          versionId,
                          sectionId,
                          payload
                      )
                    : await updatePreventiveTemplateFieldAction(
                          templateId,
                          versionId,
                          sectionId,
                          fieldId!,
                          payload
                      );

            if (!res.ok) {
                if ("errors" in res && res.errors) {
                    setErrors(res.errors as FormErrors);
                }

                setFormError(res.message || "Une erreur est survenue.");
                toast.error("Erreur", res.message || "Impossible d’enregistrer le champ.");
                return;
            }

            toast.success(
                "Succès",
                mode === "create"
                    ? "Le champ a été créé avec succès."
                    : "Le champ a été mis à jour avec succès."
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
                            <FiType className="h-5 w-5" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                {mode === "create" ? "Nouveau champ" : "Modifier le champ"}
                            </h1>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {templateName} · version {versionNumber} · {sectionTitle}
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
                                value={values.key}
                                onChange={(e) => setField("key", e.target.value)}
                                className={inputClass(Boolean(errors.key))}
                                placeholder="ex. tension_arterielle"
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

                        <Field>
                            <Label required>Libellé</Label>
                            <input
                                value={values.label}
                                onChange={(e) => setField("label", e.target.value)}
                                className={inputClass(Boolean(errors.label))}
                                placeholder="ex. Tension artérielle"
                                disabled={isPending}
                            />
                            <ErrorText errors={errors.label} />
                        </Field>

                        <Field>
                            <Label required>Type</Label>
                            <select
                                value={values.type}
                                onChange={(e) =>
                                    setField("type", e.target.value as PreventiveFieldType)
                                }
                                className={inputClass(Boolean(errors.type))}
                                disabled={isPending}
                            >
                                {fieldTypeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <ErrorText errors={errors.type} />
                        </Field>

                        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40 md:col-span-2">
                            <input
                                type="checkbox"
                                checked={values.required}
                                onChange={(e) => setField("required", e.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                                disabled={isPending}
                            />
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    Champ obligatoire
                                </p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    Le professionnel devra renseigner ce champ lors de l’exécution.
                                </p>
                            </div>
                        </label>

                        <div className="md:col-span-2">
                            <Label>Configuration JSON</Label>
                            <textarea
                                value={values.configText ?? ""}
                                onChange={(e) => setField("configText", e.target.value)}
                                rows={7}
                                className={inputClass(Boolean(errors.configText))}
                                placeholder={'ex. { "min": 0, "max": 100 }'}
                                disabled={isPending}
                            />
                            <ErrorText errors={errors.configText} />
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
                            {isPending ? "Enregistrement..." : "Enregistrer"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="xl:col-span-4">
                <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-5 dark:bg-cyan-500/10">
                    <h3 className="text-sm font-semibold text-cyan-800 dark:text-cyan-200">
                        Bon à savoir
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-cyan-700 dark:text-cyan-300">
                        Les champs appartiennent à une version. Une fois publiée, la version ne
                        devrait plus être modifiée pour préserver l’historique clinique.
                    </p>
                </div>
            </div>
        </form>
    );
}

function Field({ children }: { children: React.ReactNode }) {
    return <div className="space-y-2">{children}</div>;
}

function Label({ children, required = false }: { children: React.ReactNode; required?: boolean }) {
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

function inputClass(hasError: boolean) {
    return [
        "w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition dark:bg-slate-950 dark:text-slate-100",
        hasError
            ? "border-rose-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 dark:border-rose-500"
            : "border-slate-200 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-800",
    ].join(" ");
}