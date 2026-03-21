export function normalizeNullableString(value?: string | null) {
    const x = value?.trim();
    return x ? x : null;
}

export function normalizeEmail(value?: string | null) {
    const x = value?.trim();
    return x ? x.toLowerCase() : null;
}

export function normalizePhone(value?: string | null) {
    const x = value?.trim();
    if (!x) return null;

    return x.replace(/[^\d+]/g, "");
}