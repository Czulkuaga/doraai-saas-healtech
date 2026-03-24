import { getPermissionsCatalog } from "@/action/roles/role.queries";
import RoleForm from "@/components/private/organizations/roles/role-form";

export default async function NewRolePage() {
    const permissions = await getPermissionsCatalog();

    return (
        <RoleForm
            mode="create"
            permissions={permissions}
            initialValues={{
                name: "",
                key: "",
                isActive: true,
                permissionIds: [],
            }}
        />
    );
}