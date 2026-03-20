import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type PageProps = {
    params: Promise<{ membershipId: string }>;
};

function formatDate(date: Date) {
    return new Intl.DateTimeFormat("fr-BE", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function membershipLabel(isActive: boolean) {
    return isActive ? "Actif" : "Inactif";
}

function accountLabel(isActive: boolean) {
    return isActive ? "Actif" : "Inactif";
}

function badgeClass(active: boolean) {
    return active
        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
        : "border-slate-400/20 bg-slate-500/10 text-slate-700 dark:text-slate-300";
}

export default async function UserDetailPage({ params }: PageProps) {
    const { membershipId } = await params;
    const tenantId = await requireTenantId();

    const membership = await prisma.tenantMembership.findFirst({
        where: {
            id: membershipId,
            tenantId,
        },
        select: {
            id: true,
            category: true,
            isActive: true,
            createdAt: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    isActive: true,
                    createdAt: true,
                },
            },
        },
    });

    if (!membership) {
        notFound();
    }

    const firstName = membership.user.firstName?.trim() ?? "";
    const lastName = membership.user.lastName?.trim() ?? "";
    const fullName =
        membership.user.name?.trim() ||
        [firstName, lastName].filter(Boolean).join(" ").trim() ||
        "Sans nom";

    return (
        <div className="space-y-6 p-4 md:p-6">
            {/* Header */}
            <section className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/70 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                        Détail de l’utilisateur
                    </h1>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Consultez les informations générales et le statut d’accès de cet utilisateur.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        href="/organization/users"
                        className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                    >
                        Retour
                    </Link>

                    <Link
                        href={`/organization/users/${membership.id}/edit`}
                        className="inline-flex h-11 items-center justify-center rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 px-5 text-sm font-semibold text-white transition hover:opacity-95"
                    >
                        Modifier
                    </Link>
                </div>
            </section>

            {/* Detail card */}
            <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/70">
                <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-800 md:px-6">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Informations de l’utilisateur
                    </h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Résumé administratif de l’utilisateur au sein de l’organisation.
                    </p>
                </div>

                <div className="grid gap-5 p-5 md:grid-cols-2 md:p-6 xl:grid-cols-3">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                            Prénom
                        </p>
                        <p className="text-sm text-slate-900 dark:text-slate-100">
                            {firstName || "—"}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                            Nom
                        </p>
                        <p className="text-sm text-slate-900 dark:text-slate-100">
                            {lastName || "—"}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                            Nom complet
                        </p>
                        <p className="text-sm text-slate-900 dark:text-slate-100">
                            {fullName}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                            Adresse e-mail
                        </p>
                        <p className="break-all text-sm text-slate-900 dark:text-slate-100">
                            {membership.user.email}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                            Téléphone
                        </p>
                        <p className="text-sm text-slate-900 dark:text-slate-100">
                            {membership.user.phone || "—"}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                            Catégorie
                        </p>
                        <p className="text-sm text-slate-900 dark:text-slate-100">
                            {membership.category}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                            Statut du compte
                        </p>
                        <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${badgeClass(
                                membership.user.isActive
                            )}`}
                        >
                            {accountLabel(membership.user.isActive)}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                            Statut de l’utilisateur
                        </p>
                        <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${badgeClass(
                                membership.isActive
                            )}`}
                        >
                            {membershipLabel(membership.isActive)}
                        </span>
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                            Créé le
                        </p>
                        <p className="text-sm text-slate-900 dark:text-slate-100">
                            {formatDate(membership.createdAt)}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}