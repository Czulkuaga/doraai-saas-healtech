export const PATIENTS_BASE_PATH = "/medical-record/patients";

export function patientListPath() {
    return PATIENTS_BASE_PATH;
}

export function patientNewPath() {
    return `${PATIENTS_BASE_PATH}/new`;
}

export function patientDetailsPath(id: string) {
    return `${PATIENTS_BASE_PATH}/${id}`;
}

export function patientEditPath(id: string) {
    return `${PATIENTS_BASE_PATH}/${id}/edit`;
}