import { parsePhoneNumberFromString } from "libphonenumber-js";

export type NormalizePhoneResult =
    | {
        ok: true;
        e164: string;
        country?: string;
        national: string;
        international: string;
    }
    | {
        ok: false;
        message: string;
    };

export function normalizePhoneToE164(
    rawInput: string,
    defaultCountry: string = "BE"
): NormalizePhoneResult {
    const raw = rawInput.trim();

    if (!raw) {
        return { ok: false, message: "Le numéro de téléphone est requis." };
    }

    const phone = raw.startsWith("+")
        ? parsePhoneNumberFromString(raw)
        : parsePhoneNumberFromString(raw, defaultCountry as any);

    if (!phone || !phone.isValid()) {
        return { ok: false, message: "Numéro de téléphone invalide." };
    }

    return {
        ok: true,
        e164: phone.number,
        country: phone.country,
        national: phone.formatNational(),
        international: phone.formatInternational(),
    };
}