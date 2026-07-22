import type {
    MedicloudPatientForSimplyBook,
    SimplyBookAdminClient,
} from "./simplybook.types";

import {
    searchSimplyBookClients,
} from "./simplybook-customer.service";

import {
    buildSimplyBookPatientSearchTerms,
} from "./simplybook-search-terms";

export type SimplyBookCandidateSearchResult = {
    candidates: SimplyBookAdminClient[];

    searchedTerms: Array<{
        type:
        | "DOCUMENT"
        | "EMAIL"
        | "PHONE"
        | "NAME";

        value: string;
    }>;
};

import {
    normalizeSimplyBookBoolean,
} from "./simplybook-normalizers";

export async function searchSimplyBookCandidates(
    tenantId: string,
    patient: MedicloudPatientForSimplyBook
): Promise<SimplyBookCandidateSearchResult> {
    const terms =
        buildSimplyBookPatientSearchTerms(
            patient
        );

    const candidates =
        new Map<
            number,
            SimplyBookAdminClient
        >();

    const searchedTerms:
        SimplyBookCandidateSearchResult["searchedTerms"] = [];

    // Primero señales fuertes.
    const strongTerms =
        terms.filter(
            (term) =>
                term.type !== "NAME"
        );

    for (const term of strongTerms) {
        searchedTerms.push({
            type: term.type,
            value: term.value,
        });

        const response =
            await searchSimplyBookClients(
                tenantId,
                {
                    search: term.value,
                    page: 1,
                    onPage: 30,
                }
            );

        for (const customer of response.data) {
            if (
                normalizeSimplyBookBoolean(
                    customer.is_deleted
                )
            ) {
                continue;
            }

            candidates.set(
                customer.id,
                customer
            );
        }
    }

    /*
     * Si no encontramos nada con señales fuertes,
     * hacemos búsqueda exploratoria por nombre.
     */
    if (candidates.size === 0) {
        const nameTerms =
            terms.filter(
                (term) =>
                    term.type === "NAME"
            );

        for (const term of nameTerms) {
            searchedTerms.push({
                type: term.type,
                value: term.value,
            });

            const response =
                await searchSimplyBookClients(
                    tenantId,
                    {
                        search: term.value,
                        page: 1,
                        onPage: 30,
                    }
                );

            for (
                const customer of response.data
            ) {
                if (
                    normalizeSimplyBookBoolean(
                        customer.is_deleted
                    )
                ) {
                    continue;
                }

                candidates.set(
                    customer.id,
                    customer
                );
            }
        }
    }

    return {
        candidates:
            [...candidates.values()],

        searchedTerms,
    };
}