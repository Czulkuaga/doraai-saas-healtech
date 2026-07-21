export function normalizeEmail(
    value?: string | null,
): string | null {
    const normalized = value?.trim().toLowerCase();

    return normalized || null;
}

export function normalizePhone(
    value?: string | null,
): string | null {
    if (!value) {
        return null;
    }

    const trimmed = value.trim();
    const hasPlus = trimmed.startsWith("+");
    const digits = trimmed.replace(/\D/g, "");

    if (!digits) {
        return null;
    }

    return hasPlus ? `+${digits}` : digits;
}

export function normalizeNationalNumber(
    value?: string | null,
): string | null {
    const normalized = value
        ?.trim()
        .toUpperCase()
        .replace(/[\s./-]/g, "");

    return normalized || null;
}