import { getPreventiveTemplates } from "@/action/health-promotion/preventive-template/get-preventive-templates";
import { PreventiveTemplateShell } from "@/components/private/medical-record/health-promotion/preventive-templates/preventive-template-shell";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getSingle(value: string | string[] | undefined) {
    return typeof value === "string" ? value : undefined;
}

export default async function PreventiveTemplatesPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const sp = await searchParams;

    const query = {
        q: getSingle(sp.q),
        status: getSingle(sp.status) as "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined,
        isActive: getSingle(sp.isActive) as "true" | "false" | undefined,
        page: Number(getSingle(sp.page) ?? 1),
        pageSize: Number(getSingle(sp.pageSize) ?? 10),
    };

    const data = await getPreventiveTemplates(query);

    return (
        <PreventiveTemplateShell
            items={data.items}
            totalItems={data.totalItems}
            page={data.page}
            pageSize={data.pageSize}
            totalPages={data.totalPages}
            query={query}
        />
    );
}