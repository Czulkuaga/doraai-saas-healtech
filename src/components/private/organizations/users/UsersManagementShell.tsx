import { UserListItem, UsersQueryState } from "../../../../lib/types/users/users-types";
import { UsersTableResponsive } from "./UsersTableResponsive";
import { UsersViewHeader } from "./UsersViewHeader";

type UsersManagementShellProps = {
    items: UserListItem[];
    totalItems: number;
    query: UsersQueryState;
    onQueryChange: (patch: Partial<UsersQueryState>) => void;
    onCreate?: () => void;
    onEdit?: (user: UserListItem) => void;
    onDelete?: (user: UserListItem) => void;
    onToggleStatus?: (user: UserListItem) => void;
};

export function UsersManagementShell({
    items,
    totalItems,
    query,
    onQueryChange,
    onCreate,
    onEdit,
    onDelete,
    onToggleStatus
}: UsersManagementShellProps) {
    const totalPages = Math.max(1, Math.ceil(totalItems / query.pageSize));

    return (
        <section className="space-y-6">
            <UsersViewHeader total={totalItems} onCreate={onCreate} />

            <UsersTableResponsive
                items={items}
                totalItems={totalItems}
                page={query.page}
                totalPages={totalPages}
                pageSize={query.pageSize}
                query={query}
                onQueryChange={onQueryChange}
                onPageChange={(page) => onQueryChange({ page })}
                onCreate={onCreate}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
            />
        </section>
    );
}