import { BiPencil, BiPhone, BiPlus, BiSearch } from "react-icons/bi";
import { MembershipStatus, UserCategory, UserListItem, UsersQueryState } from "../../../../lib/types/users/users-types";
import { FiFilter } from "react-icons/fi";
import { FaUserSecret, FaUserShield } from "react-icons/fa";
import { BsTrash2 } from "react-icons/bs";
import { RiMvAiLine } from "react-icons/ri";
import { UsersPagination } from "./UsersPagination";
import { CiCircleInfo, CiCircleMinus } from "react-icons/ci";
import Link from "next/link";

type UsersTableResponsiveProps = {
    items: UserListItem[];
    totalItems: number;
    page: number;
    totalPages: number;
    pageSize: number;
    query: UsersQueryState;
    onQueryChange: (patch: Partial<UsersQueryState>) => void;
    onPageChange: (page: number) => void;
    onCreate?: () => void;
    onEdit?: (user: UserListItem) => void;
    onDelete?: (user: UserListItem) => void;
    onToggleStatus?: (user: UserListItem) => void;
};

function getInitials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((x) => x[0]?.toUpperCase())
        .join("");
}

function categoryLabel(category: UserCategory) {
    switch (category) {
        case "SUPERADMIN":
            return "Super administrateur";
        case "ADMIN":
            return "Administrateur";
        case "USER":
            return "Utilisateur";
        case "PROFESSIONAL":
            return "Professionnel";
        default:
            return category;
    }
}

function membershipLabel(status: MembershipStatus) {
    switch (status) {
        case "ACTIVE":
            return "Actif";
        case "INACTIVE":
            return "Inactif";
        case "SUSPENDED":
            return "Suspendu";
        case "PENDING":
            return "En attente";
        default:
            return "Inconnu";
    }
}

function categoryBadgeClass(category: UserCategory) {
    switch (category) {
        case "SUPERADMIN":
            return "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300";
        case "ADMIN":
            return "border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300";
        case "PROFESSIONAL":
            return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
        case "USER":
        default:
            return "border-slate-400/20 bg-slate-500/10 text-slate-700 dark:text-slate-300";
    }
}

function membershipBadgeClass(status: MembershipStatus) {
    switch (status) {
        case "ACTIVE":
            return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
        case "INACTIVE":
            return "border-slate-400/20 bg-slate-500/10 text-slate-700 dark:text-slate-300";
        case "SUSPENDED":
            return "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300";
        case "PENDING":
            return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
        default:
            return "border-slate-400/20 bg-slate-500/10 text-slate-700 dark:text-slate-300";
    }
}

export function UsersTableResponsive({
    items,
    totalItems,
    page,
    totalPages,
    pageSize,
    query,
    onQueryChange,
    onPageChange,
    onCreate,
    onEdit,
    onDelete,
    onToggleStatus
}: UsersTableResponsiveProps) {

    return (
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/70">
            {/* filtros */}
            <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:flex xl:flex-wrap">
                        <div className="relative min-w-60 xl:w-[320px]">
                            <BiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={query.search}
                                onChange={(e) => onQueryChange({ search: e.target.value, page: 1 })}
                                placeholder="Rechercher par nom, e-mail ou téléphone..."
                                className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-cyan-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                            />
                        </div>

                        <select
                            value={query.category}
                            onChange={(e) => onQueryChange({ category: e.target.value, page: 1 })}
                            className="h-11 min-w-47.5 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-cyan-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                        >
                            <option value="all">Toutes les catégories</option>
                            <option value="SUPERADMIN">Super administrateur</option>
                            <option value="ADMIN">Administrateur</option>
                            <option value="USER">Utilisateur</option>
                            <option value="PROFESSIONAL">Professionnel</option>
                        </select>

                        <select
                            value={query.status}
                            onChange={(e) => onQueryChange({ status: e.target.value, page: 1 })}
                            className="h-11 min-w-47.5 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-cyan-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="ACTIVE">Actif</option>
                            <option value="INACTIVE">Inactif</option>
                            <option value="SUSPENDED">Suspendu</option>
                            <option value="PENDING">En attente</option>
                        </select>

                        <select
                            value={query.sort}
                            onChange={(e) => onQueryChange({ sort: e.target.value, page: 1 })}
                            className="h-11 min-w-45 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-cyan-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                        >
                            <option value="recent">Plus récents</option>
                            <option value="name_asc">Nom A-Z</option>
                            <option value="name_desc">Nom Z-A</option>
                            <option value="email_asc">E-mail A-Z</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between gap-3 xl:justify-end">
                        <div className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <FiFilter className="h-4 w-4" />
                            {totalItems} résultat{totalItems === 1 ? "" : "s"}
                        </div>

                        <select
                            value={String(query.pageSize)}
                            onChange={(e) =>
                                onQueryChange({ pageSize: Number(e.target.value), page: 1 })
                            }
                            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-cyan-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                        >
                            <option value="5">5 / page</option>
                            <option value="10">10 / page</option>
                            <option value="20">20 / page</option>
                            <option value="50">50 / page</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* desktop */}
            <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full">
                    <thead className="bg-slate-50/80 dark:bg-slate-900/80">
                        <tr className="border-b border-slate-200 dark:border-slate-800">
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                                Utilisateur
                            </th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                                E-mail
                            </th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                                Téléphone
                            </th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                                Catégorie
                            </th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                                Adhésion
                            </th>
                            <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-16">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                                            <FaUserSecret className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                            Aucun utilisateur enregistré
                                        </h3>
                                        <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
                                            Lorsque vous ajouterez des utilisateurs au tenant, ils apparaîtront ici avec leur catégorie, leur statut et les actions disponibles.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={onCreate}
                                            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-cyan-500 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white"
                                        >
                                            <BiPlus className="h-4 w-4" />
                                            Créer le premier utilisateur
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            items.map((user) => (
                                <tr
                                    key={user.id}
                                    className="border-b border-slate-100 transition hover:bg-slate-50/70 dark:border-slate-900 dark:hover:bg-slate-900/40"
                                >
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-500/15 to-fuchsia-500/15 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                {user.initials || getInitials(user.fullName)}
                                            </div>
                                            <div className="min-w-0">
                                                <Link href={`/organization/users/${user.membershipId}`} className="truncate font-medium text-slate-900 dark:text-slate-100 hover:underline">
                                                    {user.fullName}
                                                </Link>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    Usuario {user.isActive === false ? "inactivo" : "activo"}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                                        {user.email}
                                    </td>

                                    <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                                        {user.phone || "—"}
                                    </td>

                                    <td className="px-4 py-4">
                                        <span
                                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${categoryBadgeClass(
                                                user.category
                                            )}`}
                                        >
                                            {categoryLabel(user.category)}
                                        </span>
                                    </td>

                                    <td className="px-4 py-4">
                                        <span
                                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${membershipBadgeClass(
                                                user.membershipStatus
                                            )}`}
                                        >
                                            {membershipLabel(user.membershipStatus)}
                                        </span>
                                    </td>

                                    <td className="px-4 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => onEdit?.(user)}
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 cursor-pointer"
                                                title="Modifier"
                                            >
                                                <BiPencil className="h-4 w-4" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => onToggleStatus?.(user)}
                                                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-3 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 cursor-pointer"
                                                title={user.membershipStatus === "ACTIVE" ? "Désactiver" : "Activer"}
                                            >
                                                {user.membershipStatus === "ACTIVE" ? <CiCircleMinus className="h-4 w-4" /> : <CiCircleInfo className="h-4 w-4" />}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => onDelete?.(user)}
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/30 text-rose-600 transition hover:bg-rose-500/10 dark:text-rose-400 cursor-pointer"
                                                title="Supprimer"
                                            >
                                                <BsTrash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* mobile / tablet */}
            <div className="grid gap-3 p-4 lg:hidden">
                {items.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-800">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                            <FaUserShield className="h-6 w-6" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            Aucun utilisateur enregistré
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Ajoutez le premier utilisateur pour commencer.
                        </p>
                        <button
                            type="button"
                            onClick={onCreate}
                            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-cyan-500 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white"
                        >
                            <BiPlus className="h-4 w-4" />
                            Créer un utilisateur
                        </button>
                    </div>
                ) : (
                    items.map((user) => (
                        <div
                            key={user.id}
                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-500/15 to-fuchsia-500/15 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {user.initials || getInitials(user.fullName)}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                                                {user.fullName}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                Utilisateur {user.isActive === false ? "inactif" : "actif"}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => onEdit?.(user)}
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 cursor-pointer"
                                            >
                                                <BiPencil className="h-4 w-4" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => onDelete?.(user)}
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/30 text-rose-600 transition hover:bg-rose-500/10 dark:text-rose-400 cursor-pointer"
                                            >
                                                <BsTrash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
                                            <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                                <RiMvAiLine className="h-3.5 w-3.5" />
                                                Email
                                            </div>
                                            <p className="break-all text-sm text-slate-800 dark:text-slate-200">
                                                {user.email}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
                                            <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                                <BiPhone className="h-3.5 w-3.5" />
                                                Téléphone
                                            </div>
                                            <p className="text-sm text-slate-800 dark:text-slate-200">
                                                {user.phone || "—"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span
                                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${categoryBadgeClass(
                                                user.category
                                            )}`}
                                        >
                                            {categoryLabel(user.category)}
                                        </span>

                                        <span
                                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${membershipBadgeClass(
                                                user.membershipStatus
                                            )}`}
                                        >
                                            {membershipLabel(user.membershipStatus)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <UsersPagination
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={onPageChange}
            />
        </div>
    );
}