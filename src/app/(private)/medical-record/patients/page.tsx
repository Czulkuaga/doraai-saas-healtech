import { listPatientsAction } from "@/action/patients/list-patients";
import { patientFiltersSchema } from "@/lib/zod/private/medical-record/patients/patient-filters.schema";
import { PatientListShell } from "@/components/private/medical-record/patients/patient-list-shell";

type Props = {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PatientsPage({ searchParams }: Props) {
    const raw = (await searchParams) ?? {};
    const parsed = patientFiltersSchema.parse(raw);
    const data = await listPatientsAction(parsed);

    return (
        <PatientListShell
            items={data.items}
            totalItems={data.totalItems}
            page={data.page}
            pageSize={data.pageSize}
            totalPages={data.totalPages}
            query={parsed}
        />
    );
}