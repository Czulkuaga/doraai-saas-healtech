import type {
    MedicloudPatientForSimplyBook,
    SimplyBookAdminClient,
    SimplyBookCustomerMatchEvaluation,
} from "./simplybook.types";

import type {
    ParsedSimplyBookCustomFields,
} from "./simplybook-custom-fields";

import {
    normalizeInternationalPhone,
    normalizeBirthDate,
    normalizeDocumentNumber,
    normalizeFullName,
    normalizePersonName,
    normalizeSimplyBookEmail,
} from "./simplybook-normalizers";

export function evaluateSimplyBookCustomerMatch(
    patient: MedicloudPatientForSimplyBook,
    customer: SimplyBookAdminClient,
    customFields: ParsedSimplyBookCustomFields
): SimplyBookCustomerMatchEvaluation {
    let score = 0;

    const matchedBy:
        SimplyBookCustomerMatchEvaluation["matchedBy"] = [];

    const conflicts:
        SimplyBookCustomerMatchEvaluation["conflicts"] = [];

    let hasHardConflict = false;

    // =========================
    // DOCUMENT
    // =========================

    const patientDocument =
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

    const simplyBookDocument =
        normalizeDocumentNumber(
            customFields.documentNumber
        );

    if (
        patientDocument &&
        simplyBookDocument
    ) {
        if (
            patientDocument ===
            simplyBookDocument
        ) {
            score += 100;
            matchedBy.push("DOCUMENT");
        } else {
            score -= 100;
            conflicts.push("DOCUMENT");
            hasHardConflict = true;
        }
    }

    // =========================
    // EMAIL
    // =========================

    const patientEmail =
        normalizeSimplyBookEmail(
            patient.emailNormalized ??
            patient.email
        );

    const simplyBookEmail =
        normalizeSimplyBookEmail(
            customer.email
        );

    if (
        patientEmail &&
        simplyBookEmail
    ) {
        if (
            patientEmail ===
            simplyBookEmail
        ) {
            score += 60;
            matchedBy.push("EMAIL");
        } else {
            score -= 15;
            conflicts.push("EMAIL");
        }
    }

    // =========================
    // PHONE
    // =========================

    const patientPhone =
        normalizeInternationalPhone(
            patient.phoneNormalized ??
            patient.phone
        );

    const simplyBookPhone =
        normalizeInternationalPhone(
            customer.phone
        );

    if (
        patientPhone &&
        simplyBookPhone
    ) {
        if (patientPhone === simplyBookPhone) {
            score += 50;
            matchedBy.push("PHONE");
        } else {
            score -= 10;
            conflicts.push("PHONE");
        }
    }

    // =========================
    // BIRTH DATE
    // =========================

    const patientBirthDate =
        normalizeBirthDate(
            patient.birthDate
        );

    const simplyBookBirthDate =
        normalizeBirthDate(
            customFields.birthDate
        );

    if (
        patientBirthDate &&
        simplyBookBirthDate
    ) {
        if (
            patientBirthDate ===
            simplyBookBirthDate
        ) {
            score += 40;
            matchedBy.push("BIRTH_DATE");
        } else {
            score -= 60;
            conflicts.push("BIRTH_DATE");
            hasHardConflict = true;
        }
    }

    // =========================
    // NAME
    // =========================

    const patientFullName =
        normalizeFullName(
            patient.firstName,
            patient.lastName
        );

    const simplyBookName =
        normalizePersonName(
            customer.name
        );

    if (
        patientFullName &&
        simplyBookName
    ) {
        if (
            patientFullName ===
            simplyBookName
        ) {
            score += 25;
            matchedBy.push("NAME");
        } else if (
            namesAreCompatible(
                patientFullName,
                simplyBookName
            )
        ) {
            score += 10;
            matchedBy.push("NAME");
        } else {
            score -= 5;
            conflicts.push("NAME");
        }
    }

    return {
        score,
        matchedBy,
        conflicts,
        hasHardConflict,
    };
}

function namesAreCompatible(
    patientName: string,
    customerName: string
): boolean {
    const patientParts =
        patientName.split(" ");

    const customerParts =
        customerName.split(" ");

    if (
        patientParts.length === 0 ||
        customerParts.length === 0
    ) {
        return false;
    }

    const patientSet =
        new Set(patientParts);

    const customerSet =
        new Set(customerParts);

    let common = 0;

    for (const part of patientSet) {
        if (customerSet.has(part)) {
            common += 1;
        }
    }

    return (
        common >= 1 &&
        common >=
        Math.min(
            patientSet.size,
            customerSet.size
        ) / 2
    );
}