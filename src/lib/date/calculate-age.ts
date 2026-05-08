export function calculateAge(
    birthDate: Date | string | null | undefined
): number | null {
    if (!birthDate) return null;

    const birth =
        birthDate instanceof Date
            ? birthDate
            : new Date(birthDate);

    if (Number.isNaN(birth.getTime())) {
        return null;
    }

    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();

    const monthDiff = today.getMonth() - birth.getMonth();

    if (
        monthDiff < 0 ||
        (monthDiff === 0 &&
            today.getDate() < birth.getDate())
    ) {
        age--;
    }

    return age;
}