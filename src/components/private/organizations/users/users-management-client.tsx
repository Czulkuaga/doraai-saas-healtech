"use client";

import * as React from "react";
import { UsersManagementShell } from "./UsersManagementShell";
import { useRouter } from "next/navigation";
import { UserListItem, UsersQueryState } from "../../../../lib/types/users/users-types";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast/use-toast";
import { removeTenantUserMembershipAction, toggleTenantUserMembershipStatusAction } from "@/action/users/user-actions";

export type UserCategory =
    | "SUPERADMIN"
    | "ADMIN"
    | "USER"
    | "PROFESSIONAL";

export type MembershipStatus =
    | "ACTIVE"
    | "INACTIVE"
    | "SUSPENDED"
    | "PENDING";

type Props = {
    initialItems: UserListItem[];
};

export function UsersManagementClient({ initialItems }: Props) {

    const router = useRouter();
    const toast = useToast();

    const [query, setQuery] = React.useState<UsersQueryState>({
        search: "",
        category: "all",
        status: "all",
        sort: "recent",
        page: 1,
        pageSize: 10,
    });

    const [deleteOpen, setDeleteOpen] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState<UserListItem | null>(null);
    const [isPending, startTransition] = React.useTransition();

    const [toggleOpen, setToggleOpen] = React.useState(false);
    const [toggleTarget, setToggleTarget] = React.useState<UserListItem | null>(null);
    const [toggleNextValue, setToggleNextValue] = React.useState<boolean>(false);

    const filtered = React.useMemo(() => {
        let data = [...initialItems];

        if (query.search.trim()) {
            const q = query.search.trim().toLowerCase();
            data = data.filter((x) => {
                return (
                    x.fullName.toLowerCase().includes(q) ||
                    x.email.toLowerCase().includes(q) ||
                    (x.phone ?? "").toLowerCase().includes(q)
                );
            });
        }

        if (query.category !== "all") {
            data = data.filter((x) => x.category === query.category);
        }

        if (query.status !== "all") {
            data = data.filter((x) => x.membershipStatus === query.status);
        }

        switch (query.sort) {
            case "name_asc":
                data.sort((a, b) => a.fullName.localeCompare(b.fullName));
                break;
            case "name_desc":
                data.sort((a, b) => b.fullName.localeCompare(a.fullName));
                break;
            case "email_asc":
                data.sort((a, b) => a.email.localeCompare(b.email));
                break;
            case "recent":
            default:
                data.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                break;
        }

        return data;
    }, [initialItems, query]);

    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / query.pageSize));

    const safePage = Math.min(query.page, totalPages);
    const start = (safePage - 1) * query.pageSize;
    const pageItems = filtered.slice(start, start + query.pageSize);

    React.useEffect(() => {
        if (query.page !== safePage) {
            setQuery((prev) => ({ ...prev, page: safePage }));
        }
    }, [query.page, safePage]);

    function handleAskDelete(user: UserListItem) {
        setSelectedUser(user);
        setDeleteOpen(true);
    }

    function handleCloseDelete() {
        if (isPending) return;
        setDeleteOpen(false);
        setSelectedUser(null);
    }

    function handleAskToggle(user: UserListItem) {
        const nextIsActive = user.membershipStatus !== "ACTIVE";

        setToggleTarget(user);
        setToggleNextValue(nextIsActive);
        setToggleOpen(true);
    }

    function handleCloseToggle() {
        if (isPending) return;
        setToggleOpen(false);
        setToggleTarget(null);
    }

    async function handleConfirmDelete() {
        if (!selectedUser) return;

        startTransition(async () => {
            const res = await removeTenantUserMembershipAction(selectedUser.membershipId);

            if (!res.ok) {
                toast.error("Erreur", res.message ?? "Une erreur est survenue.");
                return;
            }

            toast.success("Accès retiré", res.message ?? "L’accès a été retiré avec succès.");
            setDeleteOpen(false);
            setSelectedUser(null);

            // Como la data original vino de SSR, refrescamos
            router.refresh();
        });
    }

    async function handleConfirmToggle() {
        if (!toggleTarget) return;

        startTransition(async () => {
            const res = await toggleTenantUserMembershipStatusAction({
                membershipId: toggleTarget.membershipId,
                isActive: toggleNextValue,
            });

            if (!res.ok) {
                toast.error("Erreur", res.message ?? "Une erreur est survenue.");
                return;
            }

            toast.success(
                toggleNextValue ? "Utilisateur réactivé" : "Utilisateur désactivé",
                res.message ?? "Le statut a été mis à jour avec succès."
            );

            setToggleOpen(false);
            setToggleTarget(null);

            router.refresh();
        });
    }

    return (
        <>
            <UsersManagementShell
                items={pageItems}
                totalItems={totalItems}
                query={{ ...query, page: safePage }}
                onQueryChange={(patch) =>
                    setQuery((prev) => ({ ...prev, ...patch }))
                }
                onCreate={() => {
                    router.push("/organization/users/new")
                }}
                onEdit={(user) => {
                    router.push(`/organization/users/${user.membershipId}/edit`)
                }}
                onDelete={(user) => {
                    handleAskDelete(user);
                }}
                onToggleStatus={(user) => {
                    handleAskToggle(user);
                }}
            />
            <ConfirmDialog
                open={deleteOpen}
                onClose={handleCloseDelete}
                onConfirm={handleConfirmDelete}
                pending={isPending}
                variant="danger"
                title="Retirer l’accès"
                description={
                    selectedUser
                        ? `L’utilisateur ${selectedUser.fullName} n’aura plus accès à cette organisation.`
                        : "Cet utilisateur n’aura plus accès à cette organisation."
                }
                confirmLabel="Retirer l’accès"
                cancelLabel="Annuler"
            />

            <ConfirmDialog
                open={toggleOpen}
                onClose={handleCloseToggle}
                onConfirm={handleConfirmToggle}
                pending={isPending}
                variant={toggleNextValue ? "info" : "warning"}
                title={toggleNextValue ? "Réactiver l’utilisateur" : "Désactiver l’utilisateur"}
                description={
                    toggleTarget
                        ? toggleNextValue
                            ? `L’utilisateur ${toggleTarget.fullName} retrouvera l’accès à cette organisation.`
                            : `L’utilisateur ${toggleTarget.fullName} ne pourra plus accéder à cette organisation.`
                        : toggleNextValue
                            ? "Cet utilisateur retrouvera l’accès à cette organisation."
                            : "Cet utilisateur ne pourra plus accéder à cette organisation."
                }
                confirmLabel={toggleNextValue ? "Réactiver" : "Désactiver"}
                cancelLabel="Annuler"
            />
        </>
    );
}