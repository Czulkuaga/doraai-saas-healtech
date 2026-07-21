import type { SimplyBookApiErrorBody } from "./simplybook.types";

export class SimplyBookApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly responseBody: unknown
    ) {
        super(message);
        this.name = "SimplyBookApiError";
    }
}

type SimplyBookRequestOptions = {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    headers?: HeadersInit;
    body?: unknown;
};

export async function simplyBookRequest<T>(
    baseUrl: string,
    path: string,
    options: SimplyBookRequestOptions = {}
): Promise<T> {
    const normalizedBaseUrl = baseUrl.replace(/\/$/, "");

    const response = await fetch(`${normalizedBaseUrl}${path}`, {
        method: options.method ?? "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...options.headers,
        },
        body:
            options.body === undefined
                ? undefined
                : JSON.stringify(options.body),
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
    });

    const contentType = response.headers.get("content-type") ?? "";

    const responseBody: unknown = contentType.includes("application/json")
        ? await response.json().catch(() => null)
        : await response.text().catch(() => null);

    if (!response.ok) {
        const errorBody = responseBody as SimplyBookApiErrorBody | null;

        const message =
            errorBody?.message ||
            errorBody?.error ||
            `SimplyBook respondió con estado ${response.status}.`;

        throw new SimplyBookApiError(
            message,
            response.status,
            responseBody
        );
    }

    return responseBody as T;
}