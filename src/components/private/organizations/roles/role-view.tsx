import Link from "next/link";
import RoleStatusBadge from "./role-status-badge";
import { RoleDetail } from "@/lib/types/roles/role.types";

type Props = {
    role: RoleDetail;
};

export default function RoleView({ role }: Props) {
    return (
        <div className="space-y-5">
            <div className="rounded-3xl border border-emerald-500/10 bg-white p-5 shadow-sm dark:bg-slate-950">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            Détails du rôle
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Consultez les informations et les permissions associées.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Link
                            href={`/organization/roles`}
                            className="inline-flex items-center justify-center rounded-2xl bg-slate-700 hover:bg-slate-500 px-4 py-2.5 text-sm font-semibold text-white"
                        >
                            Atrás
                        </Link>

                        <Link
                            href={`/organization/roles/${role.id}/edit`}
                            className="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 px-4 py-2.5 text-sm font-semibold text-white"
                        >
                            Modifier
                        </Link>
                    </div>

                </div>
            </div>

            <div className="rounded-3xl border border-emerald-500/10 bg-white p-5 shadow-sm dark:bg-slate-950">
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Nom du rôle
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {role.name}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Clé
                        </p>
                        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                            {role.key}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Statut
                        </p>
                        <div className="mt-1">
                            <RoleStatusBadge isActive={role.isActive} />
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Type
                        </p>
                        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                            {role.isSystem ? "Système" : "Personnalisé"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Utilisateurs attribués
                        </p>
                        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                            {role.membersCount}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Date de création
                        </p>
                        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                            {new Date(role.createdAt).toLocaleString("fr-BE")}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Dernière mise à jour
                        </p>
                        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                            {new Date(role.updatedAt).toLocaleString("fr-BE")}
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-3xl border border-emerald-500/10 bg-white p-5 shadow-sm dark:bg-slate-950">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Permissions
                </h2>

                {role.permissions.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                        Aucune permission attribuée.
                    </p>
                ) : (
                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {role.permissions.map((permission) => (
                            <div
                                key={permission.id}
                                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
                            >
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {permission.key}
                                </p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    {permission.description || "Aucune description"}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}