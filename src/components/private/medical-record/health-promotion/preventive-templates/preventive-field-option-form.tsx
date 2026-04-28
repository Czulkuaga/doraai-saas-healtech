
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import { useToast } from "@/components/ui/toast/use-toast";
import { createPreventiveFieldOptionAction } from "@/action/health-promotion/preventive-template/create-preventive-field-option-action";
import { updatePreventiveFieldOptionAction } from "@/action/health-promotion/preventive-template/update-preventive-field-option-action";

type Values = {
    key: string;
    label: string;
    order: number;
};

type Props = {
    mode: "create" | "edit";
    templateId: string;
    versionId: string;
    sectionId: string;
    fieldId: string;
    optionId?: string;
    fieldLabel: string;
    initialValues?: Values;
};

type FormErrors = Partial<Record<keyof Values, string[]>>;

export function PreventiveFieldOptionForm({
    mode,
    templateId,
    versionId,
    sectionId,
    fieldId,
    optionId,
    fieldLabel,
    initialValues,
}: Props) {
    const router = useRouter();
    const toast = useToast();
    const [isPending, startTransition] = useTransition();

    const [values, setValues] = useState<Values>({
        key: "",
        label: "",
        order: 1,
        ...initialValues,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [formError, setFormError] = useState("");

    const backPath = `/medical-record/health-promotion/templates/${templateId}/versions/${versionId}/sections/${sectionId}/fields/${fieldId}`;

    function setField<K extends keyof Values>(key: K, value: Values[K]) {
        setValues((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: undefined }));
        setFormError("");
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        startTransition(async () => {
            const payload = {
                key: values.key.trim(),
                label: values.label.trim(),
                order: Number(values.order),
            };

            const res =
                mode === "create"
                    ? await createPreventiveFieldOptionAction(templateId, versionId, sectionId, fieldId, payload)
                    : await updatePreventiveFieldOptionAction(templateId, versionId, sectionId, fieldId, optionId!, payload);

            if (!res.ok) {
                if ("errors" in res && res.errors) setErrors(res.errors as FormErrors);
                setFormError(res.message || "Une erreur est survenue.");
                toast.error("Erreur", res.message || "Impossible d’enregistrer l’option.");
                return;
            }

            toast.success("Succès", mode === "create" ? "Option créée." : "Option mise à jour.");
            router.push(backPath);
            router.refresh();
        });
    }

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="xl:col-span-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        {mode === "create" ? "Nouvelle option" : "Modifier l’option"}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Champ: {fieldLabel}
                    </p>

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
                                placeholder="ex. oui"
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
                            <Label required>Libellé</Label>
                            <input
                                value={values.label}
                                onChange={(e) => setField("label", e.target.value)}
                                className={inputClass(Boolean(errors.label))}
                                placeholder="ex. Oui"
                                disabled={isPending}
                            />
                            <ErrorText errors={errors.label} />
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
                            Enregistrer
                        </button>
                    </div>
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