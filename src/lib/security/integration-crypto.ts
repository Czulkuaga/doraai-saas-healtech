import {
    createCipheriv,
    createDecipheriv,
    randomBytes,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const KEY_VERSION = "v1";

function getEncryptionKey(): Buffer {
    const encodedKey =
        process.env.INTEGRATION_ENCRYPTION_KEY_V1;

    if (!encodedKey) {
        throw new Error(
            "INTEGRATION_ENCRYPTION_KEY_V1 no está configurada."
        );
    }

    const key = Buffer.from(encodedKey, "base64");

    if (key.length !== 32) {
        throw new Error(
            "INTEGRATION_ENCRYPTION_KEY_V1 debe contener exactamente 32 bytes."
        );
    }

    return key;
}

export function encryptIntegrationSecret(
    plainText: string
): string {
    if (!plainText) {
        throw new Error("No se puede cifrar un valor vacío.");
    }

    const key = getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);

    const cipher = createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([
        cipher.update(plainText, "utf8"),
        cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return [
        KEY_VERSION,
        iv.toString("base64url"),
        authTag.toString("base64url"),
        encrypted.toString("base64url"),
    ].join(".");
}

export function decryptIntegrationSecret(
    encryptedValue: string
): string {
    const [version, ivValue, authTagValue, encryptedData] =
        encryptedValue.split(".");

    if (
        version !== KEY_VERSION ||
        !ivValue ||
        !authTagValue ||
        !encryptedData
    ) {
        throw new Error(
            "El secreto cifrado tiene un formato inválido."
        );
    }

    const key = getEncryptionKey();

    const decipher = createDecipheriv(
        ALGORITHM,
        key,
        Buffer.from(ivValue, "base64url")
    );

    decipher.setAuthTag(
        Buffer.from(authTagValue, "base64url")
    );

    const decrypted = Buffer.concat([
        decipher.update(
            Buffer.from(encryptedData, "base64url")
        ),
        decipher.final(),
    ]);

    return decrypted.toString("utf8");
}