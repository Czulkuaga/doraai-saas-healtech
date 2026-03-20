"use client";

import * as React from "react";
import Link from "next/link";
import type {
    UserFormMode,
    UserFormValues,
    UserCategory,
    MembershipStatus,
} from "@/lib/types/users/users-types";

import { PasswordStrengthHint } from "@/components/ui/password-strength/password-strength-hint";

type FieldErrors = Partial<Record<keyof UserFormValues, string>>;

type UserFormProps = {
    mode: UserFormMode;
    initialValues: UserFormValues;
    pending?: boolean;
    submitLabel?: string;
    cancelHref?: string;
    formError?: string | null;
    fieldErrors?: FieldErrors;
    onSubmit: (values: UserFormValues) => void | Promise<void>;
};

const categoryOptions: Array<{ value: UserCategory; label: string }> = [
    { value: "ADMIN", label: "Administrateur" },
    { value: "USER", label: "Utilisateur" },
    { value: "PROFESSIONAL", label: "Professionnel" },
];

const membershipOptions: Array<{ value: MembershipStatus; label: string }> = [
    { value: "ACTIVE", label: "Actif" },
    { value: "INACTIVE", label: "Inactif" },
    { value: "SUSPENDED", label: "Suspendu" },
    { value: "PENDING", label: "En attente" },
];

export function UserForm({
    mode,
    initialValues,
    pending = false,
    submitLabel,
    cancelHref = "/organization/users",
    formError,
    fieldErrors,
    onSubmit,
}: UserFormProps) {
    const [values, setValues] = React.useState<UserFormValues>({
        ...initialValues,
        password: initialValues.password ?? "",
        confirmPassword: initialValues.confirmPassword ?? "",
    });

    React.useEffect(() => {
        setValues({
            ...initialValues,
            password: initialValues.password ?? "",
            confirmPassword: initialValues.confirmPassword ?? "",
        });
    }, [initialValues]);

    // 🔥 AUTOGENERAR fullName (clave)
    React.useEffect(() => {
        const full = `${values.firstName} ${values.lastName}`.trim();
        setValues((prev) => ({ ...prev, fullName: full }));
    }, [values.firstName, values.lastName]);

    function update<K extends keyof UserFormValues>(key: K, value: UserFormValues[K]) {
        setValues((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        await onSubmit(values);
    }

    function fieldClass(hasError?: boolean) {
        return [
            "h-11 w-full rounded-2xl border bg-white px-4 text-sm text-slate-900 outline-none",
            "dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800",
            hasError
                ? "border-rose-400 focus:border-rose-500"
                : "border-slate-200 focus:border-cyan-400",
        ].join(" ");
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {formError && (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                    {formError}
                </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">

                {/* FIRST NAME */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Prénom
                    </label>
                    <input
                        value={values.firstName}
                        onChange={(e) => update("firstName", e.target.value)}
                        className={fieldClass(!!fieldErrors?.firstName)}
                        required
                    />
                    {fieldErrors?.firstName && (
                        <p className="text-sm text-rose-600 dark:text-rose-400">
                            {fieldErrors.firstName}
                        </p>
                    )}
                </div>

                {/* LAST NAME */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Nom
                    </label>
                    <input
                        value={values.lastName}
                        onChange={(e) => update("lastName", e.target.value)}
                        className={fieldClass(!!fieldErrors?.lastName)}
                        required
                    />
                    {fieldErrors?.lastName && (
                        <p className="text-sm text-rose-600 dark:text-rose-400">
                            {fieldErrors.lastName}
                        </p>
                    )}
                </div>

                {/* EMAIL */}
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Adresse e-mail
                    </label>
                    <input
                        disabled={mode === "edit"}
                        type="email"
                        value={values.email}
                        onChange={(e) => update("email", e.target.value)}
                        className={fieldClass(!!fieldErrors?.email) + " disabled:opacity-70 disabled:cursor-not-allowed"}
                        required
                    />
                    {fieldErrors?.email && (
                        <p className="text-sm text-rose-600 dark:text-rose-400">
                            {fieldErrors.email}
                        </p>
                    )}
                </div>

                {/* PHONE */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Téléphone
                    </label>
                    <input
                        value={values.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        placeholder="+32 470 12 34 56"
                        className={fieldClass(!!fieldErrors?.phone)}
                        required
                    />
                    {fieldErrors?.phone && (
                        <p className="text-sm text-rose-600 dark:text-rose-400">
                            {fieldErrors.phone}
                        </p>
                    )}
                </div>

                {/* CATEGORY */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Catégorie
                    </label>
                    <select
                        value={values.category}
                        onChange={(e) => update("category", e.target.value as UserCategory)}
                        className={fieldClass(!!fieldErrors?.category)}
                    >
                        {categoryOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* USER STATUS */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Statut du compte
                    </label>
                    <select
                        value={values.isActive ? "ACTIVE" : "INACTIVE"}
                        onChange={(e) => update("isActive", e.target.value === "ACTIVE")}
                        className={fieldClass(!!fieldErrors?.isActive)}
                    >
                        <option value="ACTIVE">Actif</option>
                        <option value="INACTIVE">Inactif</option>
                    </select>
                </div>

                {/* MEMBERSHIP */}
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Statut de l’utilisateur
                    </label>
                    <select
                        value={values.membershipStatus}
                        onChange={(e) => update("membershipStatus", e.target.value as MembershipStatus)}
                        className={fieldClass(!!fieldErrors?.membershipStatus)}
                    >
                        {membershipOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* PASSWORD */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Mot de passe
                    </label>
                    <input
                        type="password"
                        value={values.password}
                        onChange={(e) => update("password", e.target.value)}
                        className={fieldClass(!!fieldErrors?.password)}
                        required={mode === "create"}
                    />
                    {fieldErrors?.password && (
                        <p className="text-sm text-rose-600 dark:text-rose-400">
                            {fieldErrors.password}
                        </p>
                    )}
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Confirmer le mot de passe
                    </label>
                    <input
                        type="password"
                        value={values.confirmPassword}
                        onChange={(e) => update("confirmPassword", e.target.value)}
                        className={fieldClass(!!fieldErrors?.confirmPassword)}
                        required={mode === "create"}
                    />
                    {fieldErrors?.confirmPassword && (
                        <p className="text-sm text-rose-600 dark:text-rose-400">
                            {fieldErrors.confirmPassword}
                        </p>
                    )}
                </div>

                <div className="md:col-span-2">
                    <PasswordStrengthHint
                        password={values.password}
                        confirmPassword={values.confirmPassword}
                        mode={mode}
                    />
                </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
                <Link
                    href={cancelHref}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                    Annuler
                </Link>

                <button
                    type="submit"
                    disabled={pending}
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 px-5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                    {pending
                        ? "Enregistrement..."
                        : submitLabel ?? (mode === "create"
                            ? "Créer l’utilisateur"
                            : "Enregistrer les modifications")}
                </button>
            </div>
        </form>
    );
}