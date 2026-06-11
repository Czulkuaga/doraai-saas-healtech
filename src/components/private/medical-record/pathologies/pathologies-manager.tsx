// src/components/private/medical-record/pathologies/pathologies-manager.tsx

"use client";

import { useState, useTransition } from "react";
import {
    createPathologyAction,
    updatePathologyAction,
    deactivatePathologyAction,
} from "@/action/pathologies/pathology-actions";

type PathologyItem = {
    id: string;
    code: string;
    name: string;
    description: string | null;
    color: string | null;
    isActive: boolean;
};

type FormState = {
    id?: string;
    code: string;
    name: string;
    description: string;
    color: string;
    isActive: boolean;
};

const EMPTY_FORM: FormState = {
    code: "",
    name: "",
    description: "",
    color: "emerald",
    isActive: true,
};

export function PathologiesManager({ items }: { items: PathologyItem[] }) {
    const [isPending, startTransition] = useTransition();
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [isOpen, setIsOpen] = useState(false);

    const isEditing = Boolean(form.id);

    function openCreate() {
        setForm(EMPTY_FORM);
        setIsOpen(true);
    }

    function openEdit(item: PathologyItem) {
        setForm({
            id: item.id,
            code: item.code,
            name: item.name,
            description: item.description ?? "",
            color: item.color ?? "emerald",
            isActive: item.isActive,
        });
        setIsOpen(true);
    }

    function closeModal() {
        if (isPending) return;
        setIsOpen(false);
        setForm(EMPTY_FORM);
    }

    function onSave() {
        startTransition(async () => {
            if (isEditing) {
                await updatePathologyAction(form);
            } else {
                await createPathologyAction(form);
            }

            closeModal();
        });
    }

    function onDeactivate(id: string) {
        startTransition(async () => {
            await deactivatePathologyAction(id);
        });
    }

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        Catalogue des pathologies
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Créez et maintenez les pathologies disponibles pour la fiche patient.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreate}
                    className="cursor-pointer rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400"
                >
                    Nouvelle pathologie
                </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-bold text-slate-900 dark:text-slate-100">
                                        {item.name}
                                    </h3>

                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${item.isActive
                                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                                : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                            }`}
                                    >
                                        {item.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>

                                <p className="mt-1 text-xs font-semibold uppercase text-slate-500">
                                    {item.code}
                                </p>
                            </div>

                            <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                                {item.color || "emerald"}
                            </span>
                        </div>

                        {item.description && (
                            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                                {item.description}
                            </p>
                        )}

                        <div className="mt-4 flex gap-2">
                            <button
                                type="button"
                                onClick={() => openEdit(item)}
                                className="cursor-pointer flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                Modifier
                            </button>

                            {item.isActive && (
                                <button
                                    type="button"
                                    onClick={() => onDeactivate(item.id)}
                                    disabled={isPending}
                                    className="cursor-pointer flex-1 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-500/20 disabled:opacity-60 dark:text-red-300"
                                >
                                    Désactiver
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {items.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                        Aucune pathologie créée.
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Créez la première pathologie pour pouvoir l’associer aux patients.
                    </p>
                </div>
            )}

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-950">
                        <div className="mb-5">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                {isEditing ? "Modifier la pathologie" : "Nouvelle pathologie"}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Informations visibles dans la fiche patient.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <label className="block">
                                <span className="text-xs font-bold uppercase text-slate-500">
                                    Code
                                </span>
                                <input
                                    value={form.code}
                                    onChange={(e) =>
                                        setForm((current) => ({
                                            ...current,
                                            code: e.target.value.toUpperCase(),
                                        }))
                                    }
                                    placeholder="HYPERTENSION"
                                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                />
                            </label>

                            <label className="block">
                                <span className="text-xs font-bold uppercase text-slate-500">
                                    Nom
                                </span>
                                <input
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm((current) => ({
                                            ...current,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder="Hypertension artérielle"
                                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                />
                            </label>

                            <label className="block">
                                <span className="text-xs font-bold uppercase text-slate-500">
                                    Description
                                </span>
                                <textarea
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm((current) => ({
                                            ...current,
                                            description: e.target.value,
                                        }))
                                    }
                                    rows={3}
                                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                />
                            </label>

                            <label className="block">
                                <span className="text-xs font-bold uppercase text-slate-500">
                                    Couleur
                                </span>
                                <select
                                    value={form.color}
                                    onChange={(e) =>
                                        setForm((current) => ({
                                            ...current,
                                            color: e.target.value,
                                        }))
                                    }
                                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                >
                                    <option value="emerald">Emerald</option>
                                    <option value="red">Red</option>
                                    <option value="amber">Amber</option>
                                    <option value="blue">Blue</option>
                                    <option value="purple">Purple</option>
                                    <option value="rose">Rose</option>
                                    <option value="slate">Slate</option>
                                </select>
                            </label>

                            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={(e) =>
                                        setForm((current) => ({
                                            ...current,
                                            isActive: e.target.checked,
                                        }))
                                    }
                                />
                                Pathologie active
                            </label>
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={isPending}
                                className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                Annuler
                            </button>

                            <button
                                type="button"
                                onClick={onSave}
                                disabled={isPending}
                                className="cursor-pointer rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-60"
                            >
                                {isPending ? "Enregistrement..." : "Enregistrer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}