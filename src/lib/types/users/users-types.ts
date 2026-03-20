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

export type UserListItem = {
    id: string;
    membershipId: string;
    userId: string;

    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    fullName: string;

    email: string;
    phone?: string | null;

    category: UserCategory;
    membershipStatus: MembershipStatus;

    isActive: boolean;
    initials?: string;

    createdAt: string;
};

export type UsersQueryState = {
    search: string;
    category: string;
    status: string;
    sort: string;
    page: number;
    pageSize: number;
};

export type UserFormValues = {
    firstName: string;
    lastName: string;
    fullName: string;

    email: string;
    phone: string;

    category: UserCategory;
    isActive: boolean;
    membershipStatus: MembershipStatus;

    password: string;
    confirmPassword: string;
};

export type UserFormMode = "create" | "edit";