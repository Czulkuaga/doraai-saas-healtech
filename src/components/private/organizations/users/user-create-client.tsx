"use client";

import * as React from "react";
import { UserForm } from "@/components/private/organizations/users/user-form";
import type { UserFormValues } from "@/lib/types/users/users-types";
import {
    createOrAttachTenantUserAction,
} from "@/action/users/user-actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast/use-toast";

const initialValues: UserFormValues = {
    firstName: "",
    lastName: "",
    fullName: "",
    email: "",
    phone: "",
    category: "USER",
    isActive: true,
    membershipStatus: "ACTIVE",
    password: "",
    confirmPassword: "",
};

export function UserCreateClient() {
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
            const res = await createOrAttachTenantUserAction(values);

            if (!res?.ok) {
                setFormError(res.message);
                setFieldErrors(res.fieldErrors ?? {});
                return;
            }
            toast.success(
                "Utilisateur créé",
                "L’utilisateur a été ajouté avec succès."
            );

            // ✅ navegación controlada
            router.push("/organization/users");
        });
    }

    return (
        <UserForm
            mode="create"
            initialValues={initialValues}
            onSubmit={handleSubmit}
            cancelHref="/organization/users"
            submitLabel="Créer l’utilisateur"
            pending={pending}
            formError={formError}
            fieldErrors={fieldErrors}
        />
    );
}