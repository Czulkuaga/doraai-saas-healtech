export type PasswordRuleKey =
    | "min"
    | "max"
    | "upper"
    | "lower"
    | "number"
    | "special"
    | "match";

export type PasswordRule = {
    key: PasswordRuleKey;
    label: string;
    valid: boolean;
};

export function evaluatePasswordRules(
    password?: string,
    confirmPassword?: string
): PasswordRule[] {
    const safePassword = password ?? "";
    const safeConfirmPassword = confirmPassword ?? "";

    const rules: PasswordRule[] = [
        {
            key: "min",
            label: "Au moins 8 caractères",
            valid: safePassword.length >= 8,
        },
        {
            key: "max",
            label: "Maximum 50 caractères",
            valid: safePassword.length <= 50,
        },
        {
            key: "upper",
            label: "Au moins une majuscule",
            valid: /[A-Z]/.test(safePassword),
        },
        {
            key: "lower",
            label: "Au moins une minuscule",
            valid: /[a-z]/.test(safePassword),
        },
        {
            key: "number",
            label: "Au moins un chiffre",
            valid: /\d/.test(safePassword),
        },
        {
            key: "special",
            label: "Au moins un caractère spécial",
            valid: /[^A-Za-z\d]/.test(safePassword),
        },
        {
            key: "match",
            label: "Les mots de passe correspondent",
            valid:
                safeConfirmPassword.length > 0 &&
                safePassword === safeConfirmPassword,
        },
    ];

    return rules;
}

export function getPasswordStrength(password?: string): {
    score: number;
    label: "Faible" | "Moyen" | "Fort";
} {
    const safePassword = password ?? "";
    let score = 0;

    if (safePassword.length >= 8) score += 1;
    if (/[A-Z]/.test(safePassword)) score += 1;
    if (/[a-z]/.test(safePassword)) score += 1;
    if (/\d/.test(safePassword)) score += 1;
    if (/[^A-Za-z\d]/.test(safePassword)) score += 1;

    if (score <= 2) return { score, label: "Faible" };
    if (score <= 4) return { score, label: "Moyen" };
    return { score, label: "Fort" };
}