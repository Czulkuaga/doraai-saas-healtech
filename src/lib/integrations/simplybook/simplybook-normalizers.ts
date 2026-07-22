// src/lib/integrations/simplybook/simplybook-normalizers.ts

import type {
    SimplyBookBooleanLike,
} from "./simplybook.types";

/**
 * Normaliza un email exclusivamente para comparación.
 *
 * NO eliminamos puntos de Gmail.
 * NO eliminamos aliases "+tag".
 *
 * Eso podría provocar asociaciones incorrectas.
 */
export function normalizeSimplyBookEmail(
    value?: string | null
): string | null {
    if (!value) {
        return null;
    }

    const normalized = value
        .trim()
        .toLowerCase();

    return normalized || null;
}

/**
 * Devuelve únicamente los dígitos de un teléfono.
 *
 * Ejemplo:
 * +32 486 12 34 56
 * → 32486123456
 *
 * Se utiliza como representación técnica base.
 */
export function normalizePhoneDigits(
    value?: string | null
): string | null {
    if (!value) {
        return null;
    }

    const digits = value.replace(/\D/g, "");

    return digits || null;
}

/**
 * Devuelve únicamente dígitos y elimina el prefijo internacional 00.
 *
 * Ejemplos:
 *
 * +32 470 12 34 56 -> 32470123456
 * 0032 470 12 34 56 -> 32470123456
 * +57 316 406 1498 -> 573164061498
 *
 * Un número local como 0470123456 permanece:
 * 0470123456
 *
 * No inferimos país sin contexto.
 */
export function normalizeInternationalPhone(
    value?: string | null
): string | null {
    if (!value) {
        return null;
    }

    let digits = value.replace(/\D/g, "");

    if (!digits) {
        return null;
    }

    if (digits.startsWith("00")) {
        digits = digits.slice(2);
    }

    return digits;
}

export function getPhoneSearchVariants(
    value?: string | null
): string[] {
    if (!value) {
        return [];
    }

    const trimmed = value.trim();

    const normalized =
        normalizeInternationalPhone(
            trimmed
        );

    if (!normalized) {
        return [];
    }

    const variants = new Set<string>();

    variants.add(normalized);

    if (
        trimmed.startsWith("+") ||
        trimmed.startsWith("00")
    ) {
        variants.add(
            `+${normalized}`
        );
    }

    variants.add(
        trimmed.replace(/\s+/g, "")
    );

    return [...variants].filter(Boolean);
}

/**
 * Genera variantes útiles para hacer búsquedas en SimplyBook.
 *
 * La API usa filter[search], así que necesitamos probar
 * algunas representaciones históricas frecuentes.
 */


/**
 * Normaliza nombres para comparación.
 *
 * "José   García"
 * "JOSE GARCIA"
 *
 * →
 *
 * "jose garcia"
 */
export function normalizePersonName(
    value?: string | null
): string | null {
    if (!value) {
        return null;
    }

    const normalized = value
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();

    return normalized || null;
}

/**
 * Construye el nombre completo normalizado.
 */
export function normalizeFullName(
    firstName?: string | null,
    lastName?: string | null
): string | null {
    return normalizePersonName(
        [firstName, lastName]
            .filter(Boolean)
            .join(" ")
    );
}

/**
 * Normaliza documentos.
 *
 * Ejemplos:
 *
 * 85.01.01-123.45
 * 850101 123 45
 *
 * →
 *
 * 85010112345
 *
 * También admite letras para documentos extranjeros.
 */
export function normalizeDocumentNumber(
    value?: string | null
): string | null {
    if (!value) {
        return null;
    }

    const normalized = value
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");

    return normalized || null;
}

/**
 * Normaliza tipos de documento para facilitar comparación.
 */
export function normalizeDocumentType(
    value?: string | null
): string | null {
    if (!value) {
        return null;
    }

    const normalized = value
        .trim()
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Z0-9]/g, "");

    return normalized || null;
}

/**
 * Fecha YYYY-MM-DD.
 */
export function normalizeBirthDate(
    value?: Date | string | null
): string | null {
    if (!value) {
        return null;
    }

    const date =
        value instanceof Date
            ? value
            : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date
        .toISOString()
        .slice(0, 10);
}


export function normalizeSimplyBookBoolean(
    value: SimplyBookBooleanLike | null | undefined
): boolean {
    return (
        value === true ||
        value === 1 ||
        value === "1"
    );
}