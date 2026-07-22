import {
    simplyBookAdminRequest,
} from "./simplybook-admin-client";

import type {
    SimplyBookAdminClient,
    SimplyBookAdminClientSearchParams,
    SimplyBookAdminClientsResponse,
    SimplyBookClientFieldsResponse,
    SimplyBookClientFieldValuesResponse,
} from "./simplybook.types";

export async function searchSimplyBookClients(
    tenantId: string,
    params: SimplyBookAdminClientSearchParams
): Promise<SimplyBookAdminClientsResponse> {
    const query = new URLSearchParams();

    query.set(
        "filter[search]",
        params.search.trim()
    );

    query.set(
        "page",
        String(params.page ?? 1)
    );

    query.set(
        "on_page",
        String(params.onPage ?? 20)
    );

    return simplyBookAdminRequest<SimplyBookAdminClientsResponse>(
        {
            tenantId,

            path:
                `/admin/clients?${query.toString()}`,

            method: "GET",
        }
    );
}

export async function getSimplyBookClientById(
    tenantId: string,
    clientId: number
): Promise<SimplyBookAdminClient> {
    return simplyBookAdminRequest<SimplyBookAdminClient>(
        {
            tenantId,

            path:
                `/admin/clients/${clientId}`,

            method: "GET",
        }
    );
}

export async function getSimplyBookClientFields(
    tenantId: string
): Promise<SimplyBookClientFieldsResponse> {
    return simplyBookAdminRequest<SimplyBookClientFieldsResponse>({
        tenantId,
        path: "/admin/clients/fields",
        method: "GET",
    });
}

export async function getSimplyBookClientFieldValues(
    tenantId: string,
    clientId: number | string
): Promise<SimplyBookClientFieldValuesResponse> {
    return simplyBookAdminRequest<SimplyBookClientFieldValuesResponse>({
        tenantId,
        path: `/admin/clients/field-values/${encodeURIComponent(
            String(clientId)
        )}`,
        method: "GET",
    });
}