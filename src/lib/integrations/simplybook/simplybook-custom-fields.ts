import type {
    // SimplyBookClientFieldDefinition,
    SimplyBookClientFieldValuesResponse,
} from "./simplybook.types";

import {
    normalizeBirthDate,
    normalizeDocumentNumber,
    normalizeDocumentType,
} from "./simplybook-normalizers";

import type {
    SimplyBookClientFieldsResponse,
} from "./simplybook.types";

export type ParsedSimplyBookCustomFields = {
    documentType: string | null;
    documentNumber: string | null;
    birthDate: string | null;

    rawDocumentType: string | null;
    rawDocumentNumber: string | null;
    rawBirthDate: string | null;

    matchedFieldIds: {
        documentType: string | null;
        documentNumber: string | null;
        birthDate: string | null;
    };
};

export function parseSimplyBookCustomFields(
    response: SimplyBookClientFieldValuesResponse,
    mapping?: SimplyBookFieldMapping
): ParsedSimplyBookCustomFields {
    let rawDocumentType: string | null = null;
    let rawDocumentNumber: string | null = null;
    let rawBirthDate: string | null = null;

    let documentTypeFieldId: string | null = null;
    let documentNumberFieldId: string | null = null;
    let birthDateFieldId: string | null = null;

    for (const item of response.fields) {
        const fieldId =
            String(item.field.id);

        const value =
            item.value?.trim() || null;

        if (!value) {
            continue;
        }

        /*
         * Primero: mapping por ID.
         */
        if (
            mapping?.documentTypeFieldId ===
            fieldId
        ) {
            rawDocumentType = value;
            documentTypeFieldId =
                fieldId;

            continue;
        }

        if (
            mapping?.documentNumberFieldId ===
            fieldId
        ) {
            rawDocumentNumber =
                value;

            documentNumberFieldId =
                fieldId;

            continue;
        }

        if (
            mapping?.birthDateFieldId ===
            fieldId
        ) {
            rawBirthDate = value;
            birthDateFieldId =
                fieldId;

            continue;
        }

        /*
         * Fallback:
         * detección por título.
         */
        const title =
            normalizeFieldTitle(
                item.field.title
            );

        if (!title) {
            continue;
        }

        if (isDocumentTypeField(title)) {
            rawDocumentType = value;
            documentTypeFieldId =
                item.field.id;

            continue;
        }

        if (isDocumentNumberField(title)) {
            rawDocumentNumber = value;
            documentNumberFieldId =
                item.field.id;

            continue;
        }

        if (isBirthDateField(title)) {
            rawBirthDate = value;
            birthDateFieldId =
                item.field.id;
        }
    }

    return {
        rawDocumentType,
        rawDocumentNumber,
        rawBirthDate,

        documentType:
            normalizeDocumentType(
                rawDocumentType
            ),

        documentNumber:
            normalizeDocumentNumber(
                rawDocumentNumber
            ),

        birthDate:
            normalizeBirthDate(
                rawBirthDate
            ),

        matchedFieldIds: {
            documentType:
                documentTypeFieldId,

            documentNumber:
                documentNumberFieldId,

            birthDate:
                birthDateFieldId,
        },
    };
}

function normalizeFieldTitle(
    value?: string | null
): string | null {
    if (!value) {
        return null;
    }

    return value
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
}

function isDocumentTypeField(
    title: string
): boolean {
    return [
        "tipodedocumento",
        "tipodocumento",
        "typededocument",
        "typedocument",
        "documenttype",
        "identitytype",
        "typedidentite",
        "typeidentite",
    ].includes(title);
}

function isDocumentNumberField(
    title: string
): boolean {
    const knownTitles = [
        "numerodedocumento",
        "numerodocumento",
        "numerodedocument",
        "numerodocument",
        "documentnumber",
        "identitynumber",
        "numerodidentite",
        "numeroidentite",
        "numeroduregistrenationaloupasseport",
    ];

    if (knownTitles.includes(title)) {
        return true;
    }

    return (
        title.includes("registrenational") ||
        title.includes("passport") ||
        title.includes("passeport")
    );
}

function isBirthDateField(
    title: string
): boolean {
    return [
        "fechadenacimiento",
        "fechanacimiento",
        "datedenaissance",
        "datenaissance",
        "birthdate",
        "dateofbirth",
    ].includes(title);
}

export type SimplyBookFieldMapping = {
    documentTypeFieldId: string | null;
    documentNumberFieldId: string | null;
    birthDateFieldId: string | null;
};

export function resolveSimplyBookFieldMapping(
    response: SimplyBookClientFieldsResponse
): SimplyBookFieldMapping {
    const fields = response.data;

    let documentTypeFieldId: string | null = null;
    let documentNumberFieldId: string | null = null;
    let birthDateFieldId: string | null = null;

    for (const field of fields) {
        const title =
            normalizeFieldTitle(field.title);

        if (!title) {
            continue;
        }

        if (
            !documentTypeFieldId &&
            isDocumentTypeField(title)
        ) {
            documentTypeFieldId =
                String(field.id);

            continue;
        }

        if (
            !documentNumberFieldId &&
            isDocumentNumberField(title)
        ) {
            documentNumberFieldId =
                String(field.id);

            continue;
        }

        if (
            !birthDateFieldId &&
            isBirthDateField(title)
        ) {
            birthDateFieldId =
                String(field.id);
        }
    }

    return {
        documentTypeFieldId,
        documentNumberFieldId,
        birthDateFieldId,
    };
}

// function extractFieldDefinitions(
//     input: unknown
// ): SimplyBookClientFieldDefinition[] {
//     if (Array.isArray(input)) {
//         return input as SimplyBookClientFieldDefinition[];
//     }

//     if (
//         typeof input === "object" &&
//         input !== null
//     ) {
//         const object =
//             input as Record<string, unknown>;

//         if (Array.isArray(object.data)) {
//             return object.data as SimplyBookClientFieldDefinition[];
//         }

//         if (Array.isArray(object.fields)) {
//             return object.fields as SimplyBookClientFieldDefinition[];
//         }
//     }

//     return [];
// }