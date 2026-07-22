import {
    ExternalCustomerLinkStatus,
    ExternalSystem,
    IntegrationDirection,
    IntegrationOperation,
    IntegrationSyncStatus,
} from "../../../../generated/prisma/client";

import { prisma } from "@/lib/prisma";

import {
    getPatientForSimplyBook,
} from "./simplybook-patient.loader";

import {
    searchSimplyBookCandidates,
} from "./simplybook-candidate-search";

import {
    getSimplyBookClientFields,
    getSimplyBookClientFieldValues,
} from "./simplybook-customer.service";

import {
    parseSimplyBookCustomFields,
    resolveSimplyBookFieldMapping,
} from "./simplybook-custom-fields";

import {
    evaluateSimplyBookCustomerMatch,
} from "./simplybook-match-evaluator";

import type {
    SimplyBookCustomerCandidate,
    ResolveSimplyBookPatientResult,
} from "./simplybook.types";

import type {
    ParsedSimplyBookCustomFields,
} from "./simplybook-custom-fields";

export async function resolveSimplyBookPatient(
    tenantId: string,
    partnerId: string
): Promise<ResolveSimplyBookPatientResult> {
    const startedAt = new Date();

    /*
     * 1. Vínculo existente.
     */
    const existingLink =
        await prisma.externalCustomerLink.findUnique({
            where: {
                tenantId_partnerId_system: {
                    tenantId,
                    partnerId,
                    system:
                        ExternalSystem.SIMPLYBOOK,
                },
            },
        });

    if (
        existingLink?.status ===
        ExternalCustomerLinkStatus.ACTIVE &&
        existingLink.externalId
    ) {
        return {
            status: "LINKED",
            externalCustomerId:
                existingLink.externalId,
            source: "EXISTING_LINK",
        };
    }

    /*
     * 2. Paciente Medicloud.
     */
    const patient =
        await getPatientForSimplyBook(
            tenantId,
            partnerId
        );

    /*
     * 3. Buscar candidatos.
     */
    const searchResult =
        await searchSimplyBookCandidates(
            tenantId,
            patient
        );

    if (
        searchResult.candidates.length === 0
    ) {
        await saveNotFound({
            tenantId,
            partnerId,
            startedAt,
            searchedTerms:
                searchResult.searchedTerms,
        });

        return {
            status: "NOT_FOUND",
        };
    }

    /*
     * 4. Resolver mapping global de fields.
     */
    const fieldDefinitions =
        await getSimplyBookClientFields(
            tenantId
        );

    const fieldMapping =
        resolveSimplyBookFieldMapping(
            fieldDefinitions
        );

    /*
     * 5. Evaluar candidatos.
     */
    const evaluated:
        SimplyBookCustomerCandidate[] = [];

    for (
        const customer of
        searchResult.candidates
    ) {
        let customFields: ParsedSimplyBookCustomFields = {
            documentType: null,
            documentNumber: null,
            birthDate: null,

            rawDocumentType: null,
            rawDocumentNumber: null,
            rawBirthDate: null,

            matchedFieldIds: {
                documentType: null,
                documentNumber: null,
                birthDate: null,
            },
        };

        try {
            const fieldValues =
                await getSimplyBookClientFieldValues(
                    tenantId,
                    customer.id
                );

            customFields =
                parseSimplyBookCustomFields(
                    fieldValues,
                    fieldMapping
                );
        } catch (error) {
            /*
             * No descartamos todo el candidato si
             * fallan los custom fields.
             *
             * Seguimos evaluando email/teléfono/nombre.
             */
            console.warn(
                "[resolveSimplyBookPatient][field-values]",
                customer.id,
                error
            );
        }

        const evaluation =
            evaluateSimplyBookCustomerMatch(
                patient,
                customer,
                customFields
            );

        evaluated.push({
            customer,
            score: evaluation.score,
            matchedBy:
                evaluation.matchedBy,
            conflicts:
                evaluation.conflicts,
            hasHardConflict:
                evaluation.hasHardConflict,
        });
    }

    /*
     * 6. Ordenar.
     */
    evaluated.sort(
        (a, b) =>
            b.score - a.score
    );

    const validCandidates =
        evaluated.filter(
            (candidate) =>
                !candidate.hasHardConflict
        );

    /*
     * 7. Decidir vínculo automático.
     */
    const autoMatch =
        resolveAutomaticMatch(
            validCandidates
        );

    if (autoMatch) {
        await saveFound({
            tenantId,
            partnerId,
            candidate: autoMatch,
            searchedTerms:
                searchResult.searchedTerms,
            startedAt,
        });

        return {
            status: "FOUND",
            externalCustomerId:
                String(
                    autoMatch.customer.id
                ),
            confidence: "HIGH",
            matchedBy:
                autoMatch.matchedBy,
            customer:
                autoMatch.customer,
        };
    }

    /*
     * 8. Si tenemos candidatos plausibles,
     * queda ambiguo.
     */
    const plausibleCandidates =
        evaluated.filter(
            (candidate) =>
                candidate.score > 0
        );

    if (
        plausibleCandidates.length > 0
    ) {
        await saveAmbiguous({
            tenantId,
            partnerId,
            candidates:
                plausibleCandidates,
            searchedTerms:
                searchResult.searchedTerms,
            startedAt,
        });

        return {
            status: "AMBIGUOUS",
            candidates:
                plausibleCandidates,
        };
    }

    /*
     * 9. Nada válido.
     */
    await saveNotFound({
        tenantId,
        partnerId,
        startedAt,
        searchedTerms:
            searchResult.searchedTerms,
    });

    return {
        status: "NOT_FOUND",
    };
}

function resolveAutomaticMatch(
    candidates: SimplyBookCustomerCandidate[]
): SimplyBookCustomerCandidate | null {
    if (candidates.length === 0) {
        return null;
    }

    const best =
        candidates[0];

    const second =
        candidates[1] ?? null;

    const matched =
        new Set(best.matchedBy);

    /*
     * Documento exacto.
     */
    if (
        matched.has("DOCUMENT") &&
        best.score >= 100
    ) {
        if (
            !second ||
            best.score -
            second.score >= 20
        ) {
            return best;
        }
    }

    /*
     * Email + teléfono.
     */
    if (
        matched.has("EMAIL") &&
        matched.has("PHONE")
    ) {
        if (
            !second ||
            best.score -
            second.score >= 20
        ) {
            return best;
        }
    }

    /*
     * Email + nombre.
     */
    if (
        matched.has("EMAIL") &&
        matched.has("NAME") &&
        best.score >= 80
    ) {
        if (
            !second ||
            best.score -
            second.score >= 20
        ) {
            return best;
        }
    }

    /*
     * Documento + cualquier otra señal.
     */
    if (
        matched.has("DOCUMENT") &&
        best.matchedBy.length >= 2
    ) {
        return best;
    }

    /*
     * NO auto-link:
     *
     * solo teléfono
     * solo nombre
     * solo score bajo
     */
    return null;
}

async function saveFound(input: {
    tenantId: string;
    partnerId: string;
    candidate: SimplyBookCustomerCandidate;

    searchedTerms: Array<{
        type: string;
        value: string;
    }>;

    startedAt: Date;
}) {
    const customer =
        input.candidate.customer;

    await prisma.$transaction([
        prisma.externalCustomerLink.upsert({
            where: {
                tenantId_partnerId_system: {
                    tenantId:
                        input.tenantId,
                    partnerId:
                        input.partnerId,
                    system:
                        ExternalSystem.SIMPLYBOOK,
                },
            },

            create: {
                tenantId:
                    input.tenantId,
                partnerId:
                    input.partnerId,
                system:
                    ExternalSystem.SIMPLYBOOK,

                externalId:
                    String(customer.id),

                status:
                    ExternalCustomerLinkStatus.ACTIVE,

                lastMatchedAt:
                    new Date(),

                metadata: {
                    score:
                        input.candidate.score,

                    matchedBy:
                        input.candidate
                            .matchedBy,
                },
            },

            update: {
                externalId:
                    String(customer.id),

                status:
                    ExternalCustomerLinkStatus.ACTIVE,

                lastMatchedAt:
                    new Date(),

                metadata: {
                    score:
                        input.candidate.score,

                    matchedBy:
                        input.candidate
                            .matchedBy,
                },
            },
        }),

        prisma.integrationSyncLog.create({
            data: {
                tenantId:
                    input.tenantId,

                partnerId:
                    input.partnerId,

                system:
                    ExternalSystem.SIMPLYBOOK,

                direction:
                    IntegrationDirection.OUTBOUND,

                operation:
                    IntegrationOperation.SEARCH_CUSTOMER,

                status:
                    IntegrationSyncStatus.SUCCESS,

                message:
                    "SimplyBook customer matched automatically.",

                requestPayload: {
                    searchedTerms:
                        input.searchedTerms,
                },

                responsePayload: {
                    result: "FOUND",

                    externalCustomerId:
                        customer.id,

                    score:
                        input.candidate.score,

                    matchedBy:
                        input.candidate
                            .matchedBy,

                    conflicts:
                        input.candidate
                            .conflicts,
                },

                startedAt:
                    input.startedAt,

                finishedAt:
                    new Date(),
            },
        }),
    ]);
}

async function saveAmbiguous(input: {
    tenantId: string;
    partnerId: string;

    candidates:
    SimplyBookCustomerCandidate[];

    searchedTerms: Array<{
        type: string;
        value: string;
    }>;

    startedAt: Date;
}) {
    const candidateSummary =
        input.candidates
            .slice(0, 10)
            .map((candidate) => ({
                id:
                    candidate.customer.id,

                name:
                    candidate.customer.name,

                email:
                    candidate.customer.email,

                phone:
                    candidate.customer.phone,

                score:
                    candidate.score,

                matchedBy:
                    candidate.matchedBy,

                conflicts:
                    candidate.conflicts,

                hasHardConflict:
                    candidate.hasHardConflict,
            }));

    await prisma.$transaction([
        prisma.externalCustomerLink.upsert({
            where: {
                tenantId_partnerId_system: {
                    tenantId:
                        input.tenantId,
                    partnerId:
                        input.partnerId,
                    system:
                        ExternalSystem.SIMPLYBOOK,
                },
            },

            create: {
                tenantId:
                    input.tenantId,

                partnerId:
                    input.partnerId,

                system:
                    ExternalSystem.SIMPLYBOOK,

                externalId: null,

                status:
                    ExternalCustomerLinkStatus.AMBIGUOUS,

                lastMatchedAt:
                    new Date(),

                metadata: {
                    candidates:
                        candidateSummary,
                },
            },

            update: {
                externalId: null,

                status:
                    ExternalCustomerLinkStatus.AMBIGUOUS,

                lastMatchedAt:
                    new Date(),

                metadata: {
                    candidates:
                        candidateSummary,
                },
            },
        }),

        prisma.integrationSyncLog.create({
            data: {
                tenantId:
                    input.tenantId,

                partnerId:
                    input.partnerId,

                system:
                    ExternalSystem.SIMPLYBOOK,

                direction:
                    IntegrationDirection.OUTBOUND,

                operation:
                    IntegrationOperation.SEARCH_CUSTOMER,

                status:
                    IntegrationSyncStatus.SKIPPED,

                message:
                    "Multiple or insufficiently reliable SimplyBook customer matches found.",

                requestPayload: {
                    searchedTerms:
                        input.searchedTerms,
                },

                responsePayload: {
                    result:
                        "AMBIGUOUS",

                    candidates:
                        candidateSummary,
                },

                startedAt:
                    input.startedAt,

                finishedAt:
                    new Date(),
            },
        }),
    ]);
}

async function saveNotFound(input: {
    tenantId: string;
    partnerId: string;

    searchedTerms: Array<{
        type: string;
        value: string;
    }>;

    startedAt: Date;
}) {
    await prisma.$transaction([
        prisma.externalCustomerLink.upsert({
            where: {
                tenantId_partnerId_system: {
                    tenantId:
                        input.tenantId,

                    partnerId:
                        input.partnerId,

                    system:
                        ExternalSystem.SIMPLYBOOK,
                },
            },

            create: {
                tenantId:
                    input.tenantId,

                partnerId:
                    input.partnerId,

                system:
                    ExternalSystem.SIMPLYBOOK,

                externalId: null,

                status:
                    ExternalCustomerLinkStatus.NOT_FOUND,

                lastMatchedAt:
                    new Date(),

                metadata: {
                    searchedTerms:
                        input.searchedTerms,
                },
            },

            update: {
                externalId: null,

                status:
                    ExternalCustomerLinkStatus.NOT_FOUND,

                lastMatchedAt:
                    new Date(),

                metadata: {
                    searchedTerms:
                        input.searchedTerms,
                },
            },
        }),

        prisma.integrationSyncLog.create({
            data: {
                tenantId:
                    input.tenantId,

                partnerId:
                    input.partnerId,

                system:
                    ExternalSystem.SIMPLYBOOK,

                direction:
                    IntegrationDirection.OUTBOUND,

                operation:
                    IntegrationOperation.SEARCH_CUSTOMER,

                status:
                    IntegrationSyncStatus.SKIPPED,

                message:
                    "No reliable SimplyBook customer match found.",

                requestPayload: {
                    searchedTerms:
                        input.searchedTerms,
                },

                responsePayload: {
                    result:
                        "NOT_FOUND",
                },

                startedAt:
                    input.startedAt,

                finishedAt:
                    new Date(),
            },
        }),
    ]);
}