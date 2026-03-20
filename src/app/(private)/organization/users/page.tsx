import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { UsersManagementClient } from "@/components/private/organizations/users/users-management-client";

export const dynamic = "force-dynamic";

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
  fullName: string;
  firstName?: string | null;
  lastName?:string | null;
  email: string;
  phone?: string | null;
  category: UserCategory;
  membershipStatus: MembershipStatus;
  isActive: boolean;
  createdAt: string;
};

function mapMembershipStatus(isActive: boolean): MembershipStatus {
  return isActive ? "ACTIVE" : "INACTIVE";
}

export default async function UsersPage() {
  const tenantId = await requireTenantId();

  const rows = await prisma.tenantMembership.findMany({
    where: { tenantId },
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      category: true,
      isActive: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName:true,
          email: true,
          emailNormalized: true,
          phone: true,
          phoneNormalized: true,
          isActive: true,
          createdAt: true,
        },
      },
    },
  });

  const items: UserListItem[] = rows.map((row) => ({
    id: row.id,
    membershipId: row.id,
    userId: row.user.id,
    fullName: row.user.name?.trim() || "Non renseigné",
    firstName: row.user.firstName,
    lastName: row.user.lastName,
    email: row.user.email,
    phone: row.user.phone,
    category: row.category as UserCategory,
    membershipStatus: mapMembershipStatus(row.isActive),
    isActive: row.user.isActive,
    createdAt: row.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6 p-4 md:p-6">
      <UsersManagementClient initialItems={items} />
    </div>
  );
}