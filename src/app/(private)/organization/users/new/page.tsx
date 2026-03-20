import { UserFormCard } from "@/components/private/organizations/users/user-form-card";
import { UserCreateClient } from "@/components/private/organizations/users/user-create-client";

export const dynamic = "force-dynamic";

export default async function NewUserPage() {
    return (
        <div className="space-y-6 p-4 md:p-6">
            <UserFormCard
                title="Créer un utilisateur"
                description="Ajoutez un nouvel utilisateur interne, définissez sa catégorie et son statut initial."
            >
                <UserCreateClient />
            </UserFormCard>
        </div>
    );
}