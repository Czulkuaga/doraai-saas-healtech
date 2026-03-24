export type RoleListStatus = "all" | "active" | "inactive";

export type RoleListQuery = {
    q?: string;
    status?: RoleListStatus;
    page?: number;
    pageSize?: number;
};

export type PermissionOption = {
    id: string;
    key: string;
    description: string | null;
};

export type RoleListItem = {
    id: string;
    name: string;
    key: string;
    isSystem: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    permissionsCount: number;
    membersCount: number;
};

export type RoleFormValues = {
    name: string;
    key: string;
    isActive: boolean;
    permissionIds: string[];
};

export type RoleDetail = {
    id: string;
    name: string;
    key: string;
    isSystem: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    permissions: PermissionOption[];
    membersCount: number;
};

export type RolesListResult = {
    items: RoleListItem[];
    totalItems: number;
    totalPages: number;
    page: number;
    pageSize: number;
    q: string;
    status: RoleListStatus;
};