"use client";

import { BiPlus } from "react-icons/bi";
import { FaUsers, FaUserSecret } from "react-icons/fa";

type UserCategory =
    | "SUPERADMIN"
    | "ADMIN"
    | "USER"
    | "PROFESSIONAL";

type MembershipStatus =
    | "ACTIVE"
    | "INACTIVE"
    | "SUSPENDED"
    | "PENDING";

type UserListItem = {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    category: UserCategory;
    membershipStatus: MembershipStatus;
    avatarUrl?: string | null;
    initials?: string;
    isActive?: boolean;
};

type UsersQueryState = {
    search: string;
    category: string;
    status: string;
    sort: string;
    page: number;
    pageSize: number;
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
            return "Super Admin";
        case "ADMIN":
            return "Administrador";
        case "USER":
            return "Usuario";
        case "PROFESSIONAL":
            return "Profesional";
        default:
            return category;
    }
}

function membershipLabel(status: MembershipStatus) {
    switch (status) {
        case "ACTIVE":
            return "Activa";
        case "INACTIVE":
            return "Inactiva";
        case "SUSPENDED":
            return "Suspendida";
        case "PENDING":
            return "Pendiente";
        default:
            return status;
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

type UsersViewHeaderProps = {
    title?: string;
    description?: string;
    total: number;
    onCreate?: () => void;
    createLabel?: string;
};

export function UsersViewHeader({
    title = "Gestion des utilisateurs",
    description = "Gérez les utilisateurs internes, les adhésions et les accès du tenant.",
    total,
    onCreate,
    createLabel = "Ajouter un utilisateur",
}: UsersViewHeaderProps) {
    return (
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/70">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-400/10 dark:text-cyan-300">
                            <FaUsers className="h-5 w-5"/>
                        </div>

                        <div className="min-w-0">
                            <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                                {title}
                            </h1>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                {description}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                        {total} utilisateur{total === 1 ? "" : "s"}
                    </div>

                    <button
                        type="button"
                        onClick={onCreate}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.01] hover:shadow-md cursor-pointer"
                    >
                        <BiPlus className="h-4 w-4" />
                        {createLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}