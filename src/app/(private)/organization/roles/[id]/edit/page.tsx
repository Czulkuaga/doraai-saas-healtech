import { notFound } from "next/navigation";
import { getPermissionsCatalog, getRoleById } from "@/action/roles/role.queries";
import RoleForm from "@/components/private/organizations/roles/role-form";

export default async function EditRolePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const [role, permissions] = await Promise.all([
        getRoleById(id),
        getPermissionsCatalog(),
    ]);

    if (!role) notFound();

    return (
        <RoleForm
            mode="edit"
            roleId={role.id}
            permissions={permissions}
            isSystem={role.isSystem}
            initialValues={{
                name: role.name,
                key: role.key,
                isActive: role.isActive,
                permissionIds: role.permissions.map((p) => p.id),
            }}
        />
    );
}