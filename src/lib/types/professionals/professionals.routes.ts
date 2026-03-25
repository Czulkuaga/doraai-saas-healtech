export const PROFESSIONALS_BASE_PATH = "/medical-record/professionals";

export function professionalListPath() {
    return PROFESSIONALS_BASE_PATH;
}

export function professionalNewPath() {
    return `${PROFESSIONALS_BASE_PATH}/new`;
}

export function professionalDetailsPath(id: string) {
    return `${PROFESSIONALS_BASE_PATH}/${id}`;
}

export function professionalEditPath(id: string) {
    return `${PROFESSIONALS_BASE_PATH}/${id}/edit`;
}