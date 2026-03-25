import { normalizeNullableString } from "@/lib/types/business-partner/business-partner.normalizers";
import { normalizePhoneToE164 } from "./normalize-phone";

export type PhonePersistenceResult =
    | {
          ok: true;
          phone: string | null;
          phoneNormalized: string | null;
      }
    | {
          ok: false;
          message: string;
      };

export function getPhonePersistence(
    rawPhone?: string | null,
    defaultCountry: string = "BE"
): PhonePersistenceResult {
    const phone = normalizeNullableString(rawPhone);

    if (!phone) {
        return {
            ok: true,
            phone: null,
            phoneNormalized: null,
        };
    }

    const normalized = normalizePhoneToE164(phone, defaultCountry);

    if (!normalized.ok) {
        return {
            ok: false,
            message: normalized.message,
        };
    }

    return {
        ok: true,
        phone,
        phoneNormalized: normalized.e164,
    };
}