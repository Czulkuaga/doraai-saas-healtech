import type { UserFormValues } from "@/lib/types/users/users-types";

export type UserFormFieldErrors = Partial<Record<keyof UserFormValues | "membershipId", string>>;

export type UserActionState = {
    ok: boolean;
    message: string | null;
    fieldErrors?: UserFormFieldErrors;
};

export const initialUserActionState: UserActionState = {
    ok: false,
    message: null,
    fieldErrors: {},
};