import { notFound } from "next/navigation";
import { getRoleById } from "@/action/roles/role.queries";
import RoleView from "@/components/private/organizations/roles/role-view";

export default async function RoleDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const role = await getRoleById(id);

    if (!role) notFound();

    return <RoleView role={role} />;
}