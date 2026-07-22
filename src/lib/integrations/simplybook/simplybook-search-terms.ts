import type {
    MedicloudPatientForSimplyBook,
} from "./simplybook.types";

import {
    getPhoneSearchVariants,
    normalizeDocumentNumber,
    normalizeFullName,
    normalizeSimplyBookEmail,
} from "./simplybook-normalizers";

export type SimplyBookSearchTerm = {
    type:
    | "DOCUMENT"
    | "EMAIL"
    | "PHONE"
    | "NAME";

    value: string;

    priority: number;
};

export function buildSimplyBookPatientSearchTerms(
    patient: MedicloudPatientForSimplyBook
): SimplyBookSearchTerm[] {
    const terms: SimplyBookSearchTerm[] = [];

    /*
     * 1. Documento
     * Señal más fuerte.
     */
    const documentNumber =
        normalizeDocumentNumber(
            patient.identity
                ?.nationalNumberNormalized ??
            patient.identity
                ?.nationalNumber ??
            patient.identity
                ?.cardNumberNormalized ??
            patient.identity
                ?.cardNumber
        );

    if (documentNumber) {
        terms.push({
            type: "DOCUMENT",
            value: documentNumber,
            priority: 100,
        });
    }

    /*
     * 2. Email
     */
    const email =
        normalizeSimplyBookEmail(
            patient.emailNormalized ??
            patient.email
        );

    if (email) {
        terms.push({
            type: "EMAIL",
            value: email,
            priority: 80,
        });
    }

    /*
     * 3. Teléfono
     *
     * Generamos distintas variantes porque
     * el histórico de SimplyBook puede contener:
     *
     * +32486123456
     * 32486123456
     * 0486123456
     * 486123456
     */
    const phoneVariants =
        getPhoneSearchVariants(
            patient.phoneNormalized ??
            patient.phone
        );

    for (const phone of phoneVariants) {
        terms.push({
            type: "PHONE",
            value: phone,
            priority: 60,
        });
    }

    /*
     * 4. Nombre completo
     *
     * Se utiliza para encontrar candidatos,
     * pero nunca debería ser suficiente por sí
     * solo para auto-vincular un paciente.
     */
    const fullName =
        normalizeFullName(
            patient.firstName,
            patient.lastName
        );

    if (fullName) {
        terms.push({
            type: "NAME",
            value: fullName,
            priority: 20,
        });
    }

    /*
     * Eliminar términos duplicados.
     */
    const uniqueTerms =
        new Map<
            string,
            SimplyBookSearchTerm
        >();

    for (const term of terms) {
        const key =
            `${term.type}:${term.value}`;

        if (!uniqueTerms.has(key)) {
            uniqueTerms.set(
                key,
                term
            );
        }
    }

    /*
     * Más fuertes primero:
     *
     * DOCUMENT
     * EMAIL
     * PHONE
     * NAME
     */
    return [
        ...uniqueTerms.values(),
    ].sort(
        (a, b) =>
            b.priority -
            a.priority
    );
}