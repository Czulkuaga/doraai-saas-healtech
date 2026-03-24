"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRoleAction, updateRoleAction } from "@/action/roles/role.actions";
import { PermissionOption, RoleFormValues } from "@/lib/types/roles/role.types";
import { roleFormSchema } from "@/lib/zod/private/organization/roles/role.schema";
import { useToast } from "@/components/ui/toast/use-toast";

type Props = {
    mode: "create" | "edit";
    roleId?: string;
    isSystem?: boolean;
    permissions: PermissionOption[];
    initialValues: RoleFormValues;
};

type FieldErrors = Partial<Record<keyof RoleFormValues, string>>;

export default function RoleForm({
    mode,
    roleId,
    isSystem = false,
    permissions,
    initialValues,
}: Props) {
    const router = useRouter();
    const toast = useToast();
    const [isPending, startTransition] = useTransition();

    const [values, setValues] = useState<RoleFormValues>(initialValues);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [serverError, setServerError] = useState<string | null>(null);

    const groupedPermissions = useMemo(() => {
        return permissions.reduce<Record<string, PermissionOption[]>>((acc, item) => {
            const group = item.key.includes(".") ? item.key.split(".")[0] : "general";
            if (!acc[group]) acc[group] = [];
            acc[group].push(item);
            return acc;
        }, {});
    }, [permissions]);

    function setField<K extends keyof RoleFormValues>(field: K, value: RoleFormValues[K]) {
        setValues((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
        setServerError(null);
    }

    function togglePermission(permissionId: string) {
        const exists = values.permissionIds.includes(permissionId);

        setField(
            "permissionIds",
            exists
                ? values.permissionIds.filter((id) => id !== permissionId)
                : [...values.permissionIds, permissionId]
        );
    }

    function getFieldErrors(
        parsed: ReturnType<typeof roleFormSchema.safeParse>
    ): FieldErrors {
        if (parsed.success) return {};

        const fieldErrors = parsed.error.flatten().fieldErrors;

        return {
            name: fieldErrors.name?.[0],
            key: fieldErrors.key?.[0],
            isActive: fieldErrors.isActive?.[0],
            permissionIds: fieldErrors.permissionIds?.[0],
        };
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setServerError(null);

        const parsed = roleFormSchema.safeParse(values);

        if (!parsed.success) {
            const nextErrors = getFieldErrors(parsed);
            setErrors(nextErrors);

            toast.error(
                "Erreur de validation",
                "Veuillez corriger les champs du formulaire."
            );
            return;
        }

        setErrors({});

        startTransition(async () => {
            if (mode === "create") {
                const result = await createRoleAction(parsed.data);

                if (!result.ok) {
                    const nextServerError =
                        result.message ?? "Une erreur est survenue.";
                    setServerError(nextServerError);

                    toast.error("Erreur", nextServerError);
                    return;
                }

                toast.success("Succès", result.message);
                router.push(`/organization/roles/${result.id}`);
                router.refresh();
                return;
            }

            const result = await updateRoleAction(roleId!, parsed.data);

            if (!result.ok) {
                const nextServerError =
                    result.message ?? "Une erreur est survenue.";
                setServerError(nextServerError);

                toast.error("Erreur", nextServerError);
                return;
            }

            toast.success("Succès", result.message);
            router.push(`/organization/roles/${roleId}`);
            router.refresh();
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-3xl border border-emerald-500/10 bg-white p-5 shadow-sm dark:bg-slate-950">
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {mode === "create" ? "Créer un rôle" : "Modifier le rôle"}
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Configurez les informations principales et les permissions du rôle.
                </p>
            </div>

            <div className="rounded-3xl border border-emerald-500/10 bg-white p-5 shadow-sm dark:bg-slate-950">
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Nom du rôle
                        </label>
                        <input
                            value={values.name}
                            onChange={(e) => setField("name", e.target.value)}
                            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                        />
                        {errors.name ? (
                            <p className="mt-1 text-xs text-rose-500">{errors.name}</p>
                        ) : null}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Clé
                        </label>
                        <input
                            value={values.key}
                            onChange={(e) => setField("key", e.target.value)}
                            disabled={mode === "edit" && isSystem}
                            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                        />
                        {errors.key ? (
                            <p className="mt-1 text-xs text-rose-500">{errors.key}</p>
                        ) : null}
                    </div>
                </div>

                <div className="mt-4">
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <input
                            type="checkbox"
                            checked={values.isActive}
                            onChange={(e) => setField("isActive", e.target.checked)}
                            disabled={isSystem}
                            className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                        />
                        Actif
                    </label>
                </div>

                {serverError ? (
                    <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                        {serverError}
                    </div>
                ) : null}
            </div>

            <div className="rounded-3xl border border-emerald-500/10 bg-white p-5 shadow-sm dark:bg-slate-950">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Permissions
                </h2>

                {errors.permissionIds ? (
                    <p className="mt-2 text-xs text-rose-500">{errors.permissionIds}</p>
                ) : null}

                <div className="mt-4 space-y-5">
                    {Object.entries(groupedPermissions).map(([group, items]) => (
                        <div key={group}>
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">
                                {group}
                            </h3>

                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                {items.map((permission) => {
                                    const checked = values.permissionIds.includes(permission.id);

                                    return (
                                        <button
                                            key={permission.id}
                                            type="button"
                                            onClick={() => togglePermission(permission.id)}
                                            className={`rounded-2xl border p-4 text-left transition ${checked
                                                    ? "border-cyan-500 bg-cyan-500/10"
                                                    : "border-slate-200 bg-white hover:border-cyan-400 dark:border-slate-800 dark:bg-slate-900"
                                                }`}
                                        >
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                {permission.key}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                {permission.description || "Aucune description"}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-800 dark:text-slate-200 cursor-pointer"
                >
                    Annuler
                </button>

                <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 cursor-pointer"
                >
                    {isPending
                        ? "Traitement..."
                        : mode === "create"
                            ? "Créer"
                            : "Enregistrer"}
                </button>
            </div>
        </form>
    );
}