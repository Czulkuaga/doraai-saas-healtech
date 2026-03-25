export type PatientProviderAssignmentTypeValue =
    | "PRIMARY_CARE"
    | "PREVENTIVE_FOLLOWUP"
    | "NURSING"
    | "SPECIALIST_SUPPORT"
    | "OTHER";

export type PatientProviderAssignmentListItem = {
    id: string;
    tenantId: string;

    patientId: string;
    providerProfileId: string;

    assignmentType: PatientProviderAssignmentTypeValue;
    isPrimary: boolean;
    isActive: boolean;

    startDate: string | null;
    endDate: string | null;
    notes: string | null;

    createdAt: string;
    updatedAt: string;

    patient: {
        id: string;
        code: string;
        label: string;
        email: string | null;
        phone: string | null;
    };

    provider: {
        id: string;
        partnerId: string;
        code: string;
        label: string;
        email: string | null;
        phone: string | null;
        licenseNumber: string | null;
    };
};

export type PatientProviderAssignmentFilters = {
    q?: string;
    patientId?: string;
    providerProfileId?: string;
    assignmentType?: PatientProviderAssignmentTypeValue | "";
    isActive?: "true" | "false" | "";
    isPrimary?: "true" | "false" | "";
    page?: number;
    pageSize?: number;
};

export type PatientProviderAssignmentFormValues = {
    patientId: string;
    providerProfileId: string;
    assignmentType: PatientProviderAssignmentTypeValue;
    isPrimary: boolean;
    isActive: boolean;
    startDate?: string | null;
    endDate?: string | null;
    notes?: string | null;
};