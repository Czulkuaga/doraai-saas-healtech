import { getRolesList } from "@/action/roles/role.queries";
import RolesManagementShell from "@/components/private/organizations/roles/roles-management-shell";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RolesPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const data = await getRolesList(params);

  return <RolesManagementShell {...data} />;
}