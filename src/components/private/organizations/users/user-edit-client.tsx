"use client";

import * as React from "react";
import { UserForm } from "@/components/private/organizations/users/user-form";
import type { UserFormValues } from "@/lib/types/users/users-types";
import {
    updateTenantUserAndMembershipAction,
} from "@/action/users/user-actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast/use-toast";

type Props = {
    membershipId: string;
    initialValues: UserFormValues;
};

export function UserEditClient({ membershipId, initialValues }: Props) {
    const router = useRouter()
    const toast = useToast();

    const [pending, startTransition] = React.useTransition();
    const [formError, setFormError] = React.useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = React.useState<
        Partial<Record<keyof UserFormValues, string>>
    >({});

    async function handleSubmit(values: UserFormValues) {
        setFormError(null);
        setFieldErrors({});

        startTransition(async () => {
            const res = await updateTenantUserAndMembershipAction({
                membershipId,
                ...values,
            });

            if (!res?.ok) {
                setFormError(res?.message ?? "Une erreur est survenue.");
                setFieldErrors((res?.fieldErrors ?? {}) as Partial<Record<keyof UserFormValues, string>>);
                return
            }

            if (res.ok) {
                toast.success(
                    "Utilisateur mis à jour",
                    "Les modifications ont été enregistrées."
                );

                // ✅ navegación controlada
                router.push("/organization/users");
                return
            }
        });
    }

    return (
        <UserForm
            mode="edit"
            initialValues={initialValues}
            onSubmit={handleSubmit}
            cancelHref="/organization/users"
            submitLabel="Enregistrer les modifications"
            pending={pending}
            formError={formError}
            fieldErrors={fieldErrors}
        />
    );
}