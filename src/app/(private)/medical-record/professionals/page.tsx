import { listProfessionalsAction } from "@/action/professionals/list-professionals";
import { professionalFiltersSchema } from "@/lib/zod/private/medical-record/professionals/professional-filters.schema";
import { ProfessionalListShell } from "@/components/private/medical-record/professionals/professional-list-shell";

type Props = {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProfessionalsPage({ searchParams }: Props) {
    const raw = (await searchParams) ?? {};
    const parsed = professionalFiltersSchema.parse(raw);
    const data = await listProfessionalsAction(parsed);

    return (
        <ProfessionalListShell
            items={data.items}
            totalItems={data.totalItems}
            page={data.page}
            pageSize={data.pageSize}
            totalPages={data.totalPages}
            query={parsed}
        />
    );
}