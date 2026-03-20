import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { UserFormCard } from "@/components/private/organizations/users/user-form-card";
import { UserEditClient } from "@/components/private/organizations/users/user-edit-client";
import type { MembershipStatus, UserFormValues } from "@/lib/types/users/users-types";

export const dynamic = "force-dynamic";

function mapMembershipStatus(isActive: boolean): MembershipStatus {
    return isActive ? "ACTIVE" : "INACTIVE";
}

type PageProps = {
    params: Promise<{ membershipId: string }>;
};

export default async function EditUserPage({ params }: PageProps) {
    const { membershipId } = await params;
    const tenantId = await requireTenantId();

    const membership = await prisma.tenantMembership.findFirst({
        where: {
            id: membershipId,
            tenantId,
        },
        select: {
            id: true,
            category: true,
            isActive: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    firstName: true,
                    lastName: true,
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

    if (!membership) {
        notFound();
    }

    const initialValues: UserFormValues = {
        firstName: membership.user.firstName ?? "",
        lastName: membership.user.lastName ?? "",
        fullName: membership.user.name ?? "",
        email: membership.user.email ?? "",
        phone: membership.user.phone ?? "",
        category: membership.category,
        isActive: membership.user.isActive,
        membershipStatus: mapMembershipStatus(membership.isActive),
        password: "",
        confirmPassword: "",
    };

    return (
        <div className="space-y-6 p-4 md:p-6">
            <UserFormCard
                title="Modifier l’utilisateur"
                description="Mettez à jour les informations générales, la catégorie et le statut de cet utilisateur."
            >
                <UserEditClient
                    membershipId={membership.id}
                    initialValues={initialValues}
                />
            </UserFormCard>
        </div>
    );
}