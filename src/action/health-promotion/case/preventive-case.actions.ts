// src/action/preventive-case/preventive-case.actions.ts

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { nextNumberRangeCode } from "@/lib/number-range";
import {
    NumberRangeObject,
    PreventiveCaseStatus,
    PreventiveFieldType,
    PreventiveValueKind,
} from "../../../../generated/prisma/enums";
import {
    createPreventiveCaseSchema,
    preventiveCaseIdSchema,
    savePreventiveCaseAnswersSchema,
    updatePreventiveCaseMetaSchema,
} from "../../../lib/zod/private/health-promotion/case/preventive-case.schema";

type FieldErrorsById = Record<string, string>;

function isEmptyAnswer(value: unknown) {
    return (
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
    );
}

function isValidDateValue(value: unknown) {
    if (typeof value !== "string" || !value) return false;

    const date = new Date(value);

    return !Number.isNaN(date.getTime());
}

function isValidNumberValue(value: unknown) {
    if (value === "" || value === null || value === undefined) return false;

    const numberValue = Number(value);

    return Number.isFinite(numberValue);
}

function parseJsonValue(value: unknown) {
    if (typeof value !== "string") {
        return {
            ok: true as const,
            value,
        };
    }

    if (!value.trim()) {
        return {
            ok: true as const,
            value: null,
        };
    }

    try {
        return {
            ok: true as const,
            value: JSON.parse(value),
        };
    } catch {
        return {
            ok: false as const,
            message: "Le format JSON est invalide.",
        };
    }
}

function mapFieldTypeToValueKind(type: PreventiveFieldType): PreventiveValueKind {
    switch (type) {
        case PreventiveFieldType.TEXT:
            return PreventiveValueKind.STRING;
        case PreventiveFieldType.TEXTAREA:
            return PreventiveValueKind.STRING;

        case PreventiveFieldType.NUMBER:
            return PreventiveValueKind.NUMBER;

        case PreventiveFieldType.BOOLEAN:
            return PreventiveValueKind.BOOLEAN;

        case PreventiveFieldType.DATE:
            return PreventiveValueKind.DATE;

        case PreventiveFieldType.DATETIME:
            return PreventiveValueKind.DATETIME;

        case PreventiveFieldType.SINGLE_SELECT:
            return PreventiveValueKind.OPTION;

        case PreventiveFieldType.MULTI_SELECT:
            return PreventiveValueKind.OPTION_LIST;

        case PreventiveFieldType.FILE:
            return PreventiveValueKind.JSON;
        case PreventiveFieldType.JSON:
            return PreventiveValueKind.JSON;

        default: {
            const exhaustiveCheck: never = type;
            return exhaustiveCheck;
        }
    }
}

export async function createPreventiveCaseAction(rawInput: unknown) {

    const tenantId = await requireTenantId();
    const parsed = createPreventiveCaseSchema.safeParse(rawInput);

    if (!parsed.success) {
        return {
            ok: false as const,
            message: "Veuillez vérifier les champs du formulaire.",
            fieldErrors: parsed.error.flatten().fieldErrors,
        };
    }

    const input = parsed.data;

    const template = await prisma.preventiveTemplate.findFirst({
        where: {
            id: input.templateId,
            tenantId,
            isActive: true,
            publishedVersionId: { not: null },
        },
        select: {
            id: true,
            publishedVersionId: true,
            serviceTypeId: true,
            specialtyId: true,
        },
    });

    if (!template?.publishedVersionId) {
        return {
            ok: false as const,
            message: "Ce modèle préventif n’a pas de version publiée.",
        };
    }

    const templateVersionId = template.publishedVersionId;

    const patient = await prisma.businessPartner.findFirst({
        where: {
            id: input.patientId,
            tenantId,
        },
        select: { id: true },
    });

    if (!patient) {
        return {
            ok: false as const,
            message: "Patient introuvable.",
        };
    }

    const created = await prisma.$transaction(async (tx) => {
        const code = await nextNumberRangeCode({
            tenantId,
            object: NumberRangeObject.PREVENTIVE_CASE,
            defaultPrefix: "PC",
            tx,
        });

        return tx.preventiveCase.create({
            data: {
                tenantId,
                code,
                patientId: input.patientId,
                templateVersionId,
                providerProfileId: input.providerProfileId || null,
                orgUnitId: input.orgUnitId || null,
                locationId: input.locationId || null,
                serviceTypeId: template.serviceTypeId,
                specialtyId: template.specialtyId,
                notes: input.notes || null,
            },
            select: {
                id: true,
                code: true,
            },
        });
    });

    revalidatePath("/medical-record/health-promotion/cases");

    return {
        ok: true as const,
        message: "Cas préventif créé correctement.",
        data: created,
    };
}

export async function savePreventiveCaseAnswersAction(rawInput: unknown) {

    const tenantId = await requireTenantId();
    const parsed = savePreventiveCaseAnswersSchema.safeParse(rawInput);

    if (!parsed.success) {
        return {
            ok: false as const,
            message: "Veuillez vérifier les réponses.",
            fieldErrors: parsed.error.flatten().fieldErrors,
        };
    }

    const { caseId, answers } = parsed.data;

    const preventiveCase = await prisma.preventiveCase.findFirst({
        where: {
            id: caseId,
            tenantId,
        },
        select: {
            id: true,
            status: true,
            templateVersionId: true,
        },
    });

    if (!preventiveCase) {
        return {
            ok: false as const,
            message: "Cas préventif introuvable.",
        };
    }

    if (
        preventiveCase.status === PreventiveCaseStatus.COMPLETED ||
        preventiveCase.status === PreventiveCaseStatus.CANCELLED
    ) {
        return {
            ok: false as const,
            message: "Ce cas ne peut plus être modifié.",
        };
    }

    const fields = await prisma.preventiveTemplateField.findMany({
        where: {
            tenantId,
            versionId: preventiveCase.templateVersionId,
        },
        select: {
            id: true,
            type: true,
            required: true,
            options: {
                select: {
                    id: true,
                },
            },
        },
    });

    const fieldErrors: FieldErrorsById = {};

    const fieldsById = new Map(fields.map((field) => [field.id, field]));

    for (const field of fields) {
        const rawValue = answers[field.id];

        if (field.required && isEmptyAnswer(rawValue)) {
            fieldErrors[field.id] = "Ce champ est obligatoire.";
            continue;
        }

        if (isEmptyAnswer(rawValue)) {
            continue;
        }

        if (field.type === PreventiveFieldType.NUMBER && !isValidNumberValue(rawValue)) {
            fieldErrors[field.id] = "Veuillez saisir un nombre valide.";
            continue;
        }

        if (field.type === PreventiveFieldType.DATE && !isValidDateValue(rawValue)) {
            fieldErrors[field.id] = "Veuillez saisir une date valide.";
            continue;
        }

        if (field.type === PreventiveFieldType.DATETIME && !isValidDateValue(rawValue)) {
            fieldErrors[field.id] = "Veuillez saisir une date et une heure valides.";
            continue;
        }

        if (field.type === PreventiveFieldType.SINGLE_SELECT) {
            const optionId = typeof rawValue === "string" ? rawValue : "";

            const exists = field.options.some((option) => option.id === optionId);

            if (!exists) {
                fieldErrors[field.id] = "Veuillez sélectionner une option valide.";
                continue;
            }
        }

        if (field.type === PreventiveFieldType.MULTI_SELECT) {
            const optionIds = Array.isArray(rawValue)
                ? rawValue.filter((value): value is string => typeof value === "string")
                : [];

            const validOptionIds = field.options.map((option) => option.id);

            const allValid = optionIds.every((optionId) =>
                validOptionIds.includes(optionId)
            );

            if (!allValid) {
                fieldErrors[field.id] = "Une ou plusieurs options sont invalides.";
                continue;
            }
        }

        if (field.type === PreventiveFieldType.JSON) {
            const parsedJson = parseJsonValue(rawValue);

            if (!parsedJson.ok) {
                fieldErrors[field.id] = parsedJson.message;
                continue;
            }
        }
    }

    if (Object.keys(fieldErrors).length > 0) {
        return {
            ok: false as const,
            message: "Veuillez corriger les réponses du formulaire.",
            fieldErrors,
        };
    }


    await prisma.$transaction(async (tx) => {
        for (const [fieldId, rawValue] of Object.entries(answers)) {
            const field = fieldsById.get(fieldId);

            if (!field) continue;

            const kind = mapFieldTypeToValueKind(field.type);

            await tx.preventiveCaseValueOption.deleteMany({
                where: {
                    tenantId,
                    value: {
                        caseId,
                        fieldId,
                    },
                },
            });

            await tx.preventiveCaseValue.deleteMany({
                where: {
                    tenantId,
                    caseId,
                    fieldId,
                },
            });

            if (
                rawValue === undefined ||
                rawValue === null ||
                rawValue === "" ||
                (Array.isArray(rawValue) && rawValue.length === 0)
            ) {
                continue;
            }

            if (field.type === PreventiveFieldType.MULTI_SELECT) {
                const optionIds = Array.isArray(rawValue)
                    ? rawValue.filter((value): value is string => typeof value === "string")
                    : [];

                const validOptionIds = field.options.map((option) => option.id);
                const safeOptionIds = optionIds.filter((optionId) =>
                    validOptionIds.includes(optionId)
                );

                const createdValue = await tx.preventiveCaseValue.create({
                    data: {
                        tenantId,
                        caseId,
                        fieldId,
                        kind,
                        valueJson: safeOptionIds,
                    },
                    select: {
                        id: true,
                    },
                });

                if (safeOptionIds.length > 0) {
                    await tx.preventiveCaseValueOption.createMany({
                        data: safeOptionIds.map((optionId) => ({
                            tenantId,
                            valueId: createdValue.id,
                            optionId,
                        })),
                        skipDuplicates: true,
                    });
                }

                continue;
            }

            if (field.type === PreventiveFieldType.SINGLE_SELECT) {
                const optionId = typeof rawValue === "string" ? rawValue : null;

                const exists = field.options.some((option) => option.id === optionId);

                if (!optionId || !exists) continue;

                await tx.preventiveCaseValue.create({
                    data: {
                        tenantId,
                        caseId,
                        fieldId,
                        kind,
                        optionId,
                    },
                });

                continue;
            }

            await tx.preventiveCaseValue.create({
                data: {
                    tenantId,
                    caseId,
                    fieldId,
                    kind,
                    valueString:
                        field.type === PreventiveFieldType.TEXT ||
                            field.type === PreventiveFieldType.TEXTAREA
                            ? String(rawValue)
                            : null,
                    valueNumber:
                        field.type === PreventiveFieldType.NUMBER
                            ? Number(rawValue)
                            : null,
                    valueBoolean:
                        field.type === PreventiveFieldType.BOOLEAN
                            ? Boolean(rawValue)
                            : null,
                    valueDate:
                        field.type === PreventiveFieldType.DATE
                            ? new Date(String(rawValue))
                            : null,
                    valueDateTime:
                        field.type === PreventiveFieldType.DATETIME
                            ? new Date(String(rawValue))
                            : null,
                    valueJson:
                        field.type === PreventiveFieldType.FILE
                            ? rawValue
                            : field.type === PreventiveFieldType.JSON
                                ? parseJsonValue(rawValue).ok
                                    ? parseJsonValue(rawValue).value
                                    : null
                                : undefined,
                },
            });
        }

        if (preventiveCase.status === PreventiveCaseStatus.OPEN) {
            await tx.preventiveCase.update({
                where: { id: caseId },
                data: {
                    status: PreventiveCaseStatus.IN_PROGRESS,
                },
            });
        }
    });

    revalidatePath(`/medical-record/health-promotion/cases/${caseId}`);
    revalidatePath(`/medical-record/health-promotion/cases/${caseId}/edit`);
    revalidatePath("/medical-record/health-promotion/cases");

    return {
        ok: true as const,
        message: "Réponses enregistrées correctement.",
    };
}

export async function completePreventiveCaseAction(rawInput: unknown) {
    const tenantId = await requireTenantId();

    const parsed = preventiveCaseIdSchema.safeParse(rawInput);

    if (!parsed.success) {
        return {
            ok: false as const,
            message: "Identifiant invalide.",
        };
    }

    const preventiveCase = await prisma.preventiveCase.findFirst({
        where: {
            id: parsed.data.id,
            tenantId,
        },
        select: {
            id: true,
            status: true,
            _count: {
                select: {
                    values: true,
                },
            },
        },
    });

    if (!preventiveCase) {
        return {
            ok: false as const,
            message: "Cas préventif introuvable.",
        };
    }

    if (preventiveCase.status === PreventiveCaseStatus.CANCELLED) {
        return {
            ok: false as const,
            message: "Un cas annulé ne peut pas être complété.",
        };
    }

    if (preventiveCase.status === PreventiveCaseStatus.COMPLETED) {
        return {
            ok: false as const,
            message: "Ce cas est déjà complété.",
        };
    }

    if (preventiveCase._count.values === 0) {
        return {
            ok: false as const,
            message:
                "Ce cas ne peut pas être complété sans réponses enregistrées.",
        };
    }

    await prisma.preventiveCase.update({
        where: {
            id: preventiveCase.id,
        },
        data: {
            status: PreventiveCaseStatus.COMPLETED,
            completedAt: new Date(),
        },
    });

    revalidatePath("/medical-record/health-promotion/cases");
    revalidatePath(`/medical-record/health-promotion/cases/${preventiveCase.id}`);
    revalidatePath(`/medical-record/health-promotion/cases/${preventiveCase.id}/edit`);

    return {
        ok: true as const,
        message: "Cas préventif complété correctement.",
    };
}

export async function cancelPreventiveCaseAction(rawInput: unknown) {
    const tenantId = await requireTenantId();

    const parsed = preventiveCaseIdSchema.safeParse(rawInput);

    if (!parsed.success) {
        return {
            ok: false as const,
            message: "Identifiant invalide.",
        };
    }

    const preventiveCase = await prisma.preventiveCase.findFirst({
        where: {
            id: parsed.data.id,
            tenantId,
        },
        select: {
            id: true,
            status: true,
        },
    });

    if (!preventiveCase) {
        return {
            ok: false as const,
            message: "Cas préventif introuvable.",
        };
    }

    if (preventiveCase.status === PreventiveCaseStatus.COMPLETED) {
        return {
            ok: false as const,
            message: "Un cas complété ne peut pas être annulé.",
        };
    }

    if (preventiveCase.status === PreventiveCaseStatus.CANCELLED) {
        return {
            ok: false as const,
            message: "Ce cas est déjà annulé.",
        };
    }

    await prisma.preventiveCase.update({
        where: {
            id: preventiveCase.id,
        },
        data: {
            status: PreventiveCaseStatus.CANCELLED,
            cancelledAt: new Date(),
        },
    });

    revalidatePath("/medical-record/health-promotion/cases");
    revalidatePath(`/medical-record/health-promotion/cases/${preventiveCase.id}`);
    revalidatePath(`/medical-record/health-promotion/cases/${preventiveCase.id}/edit`);

    return {
        ok: true as const,
        message: "Cas préventif annulé correctement.",
    };
}

export async function deletePreventiveCaseAction(rawInput: unknown) {
    const tenantId = await requireTenantId();

    const parsed = preventiveCaseIdSchema.safeParse(rawInput);

    if (!parsed.success) {
        return {
            ok: false as const,
            message: "Identifiant invalide.",
        };
    }

    const caseId = parsed.data.id;

    const preventiveCase = await prisma.preventiveCase.findFirst({
        where: {
            id: caseId,
            tenantId,
        },
        select: {
            id: true,
            status: true,
            _count: {
                select: {
                    values: true,
                },
            },
        },
    });

    if (!preventiveCase) {
        return {
            ok: false as const,
            message: "Cas préventif introuvable.",
        };
    }

    if (preventiveCase.status !== PreventiveCaseStatus.OPEN) {
        return {
            ok: false as const,
            message: "Seuls les cas ouverts peuvent être supprimés.",
        };
    }

    if (preventiveCase._count.values > 0) {
        return {
            ok: false as const,
            message:
                "Ce cas contient déjà des réponses. Il doit être annulé au lieu d’être supprimé.",
        };
    }

    await prisma.preventiveCase.delete({
        where: {
            id: preventiveCase.id,
        },
    });

    revalidatePath("/medical-record/health-promotion/cases");

    return {
        ok: true as const,
        message: "Cas préventif supprimé correctement.",
    };
}

export async function updatePreventiveCaseMetaAction(rawInput: unknown) {
    const tenantId = await requireTenantId();

    const parsed = updatePreventiveCaseMetaSchema.safeParse(rawInput);

    if (!parsed.success) {
        return {
            ok: false as const,
            message: "Veuillez vérifier les champs du formulaire.",
            fieldErrors: parsed.error.flatten().fieldErrors,
        };
    }

    const input = parsed.data;

    const preventiveCase = await prisma.preventiveCase.findFirst({
        where: {
            id: input.id,
            tenantId,
        },
        select: {
            id: true,
            status: true,
        },
    });

    if (!preventiveCase) {
        return {
            ok: false as const,
            message: "Cas préventif introuvable.",
        };
    }

    if (
        preventiveCase.status === PreventiveCaseStatus.COMPLETED ||
        preventiveCase.status === PreventiveCaseStatus.CANCELLED
    ) {
        return {
            ok: false as const,
            message: "Ce cas ne peut plus être modifié.",
        };
    }

    await prisma.preventiveCase.update({
        where: { id: preventiveCase.id },
        data: {
            providerProfileId: input.providerProfileId || null,
            orgUnitId: input.orgUnitId || null,
            locationId: input.locationId || null,
            notes: input.notes || null,
        },
    });

    revalidatePath(`/medical-record/health-promotion/cases/${preventiveCase.id}`);
    revalidatePath(`/medical-record/health-promotion/cases/${preventiveCase.id}/edit`);
    revalidatePath("/medical-record/health-promotion/cases");

    return {
        ok: true as const,
        message: "Informations du cas enregistrées.",
    };
}