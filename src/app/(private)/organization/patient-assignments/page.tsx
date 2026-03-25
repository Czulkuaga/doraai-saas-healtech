import { getPatientProviderAssignments } from "@/action/patient-provider-assignment/get-patient-provider-assignments";
import { PatientProviderAssignmentShell } from "@/components/private/patient-provider-assignment/patient-provider-assignment-shell";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getSingle(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function PatientAssignmentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  const query = {
    q: getSingle(sp.q),
    patientId: getSingle(sp.patientId),
    providerProfileId: getSingle(sp.providerProfileId),
    assignmentType: getSingle(sp.assignmentType) as
      | "PRIMARY_CARE"
      | "PREVENTIVE_FOLLOWUP"
      | "NURSING"
      | "SPECIALIST_SUPPORT"
      | "OTHER"
      | undefined,
    isActive: getSingle(sp.isActive) as "true" | "false" | undefined,
    isPrimary: getSingle(sp.isPrimary) as "true" | "false" | undefined,
    page: Number(getSingle(sp.page) ?? 1),
    pageSize: Number(getSingle(sp.pageSize) ?? 10),
  };

  const data = await getPatientProviderAssignments(query);

  return (
    <PatientProviderAssignmentShell
      items={data.items}
      totalItems={data.totalItems}
      page={data.page}
      pageSize={data.pageSize}
      totalPages={data.totalPages}
      query={query}
    />
  );
}