// src/app/(private)/medical-record/health-promotion/cases/page.tsx

import { Prisma } from "../../../../../../generated/prisma/client";
import { PreventiveCaseStatus } from "../../../../../../generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { PreventiveCasesHeader } from "@/components/private/medical-record/health-promotion/cases/preventive-cases-header";
import { PreventiveCasesFilters } from "@/components/private/medical-record/health-promotion/cases/preventive-cases-filters";
import { PreventiveCasesTable } from "@/components/private/medical-record/health-promotion/cases/preventive-cases-table";
import { PreventiveCasesPagination } from "@/components/private/medical-record/health-promotion/cases/preventive-cases-pagination";
import type {
    PreventiveCaseQuery,
    PreventiveCaseSortBy,
    PreventiveCaseSortDir,
} from "@/lib/types/health-promotion/case/preventive-case.types";

type SearchParams = {
    q?: string;
    status?: string;
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortDir?: string;
};

function getPartnerName(partner: {
    firstName: string | null;
    lastName: string | null;
    organizationName: string | null;
}) {
    const fullName = [partner.firstName, partner.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

    return fullName || partner.organizationName || "—";
}

function parseQuery(searchParams: SearchParams): PreventiveCaseQuery {
    const page = Number(searchParams.page || 1);
    const pageSize = Number(searchParams.pageSize || 10);

    const validSortBy: PreventiveCaseSortBy[] = [
        "code",
        "patient",
        "template",
        "status",
        "openedAt",
    ];

    const validSortDir: PreventiveCaseSortDir[] = ["asc", "desc"];

    const status = Object.values(PreventiveCaseStatus).includes(
        searchParams.status as PreventiveCaseStatus
    )
        ? (searchParams.status as PreventiveCaseStatus)
        : "";

    return {
        q: searchParams.q?.trim() || "",
        status,
        page: Number.isFinite(page) && page > 0 ? page : 1,
        pageSize: [10, 20, 50, 100].includes(pageSize) ? pageSize : 10,
        sortBy: validSortBy.includes(searchParams.sortBy as PreventiveCaseSortBy)
            ? (searchParams.sortBy as PreventiveCaseSortBy)
            : "openedAt",
        sortDir: validSortDir.includes(searchParams.sortDir as PreventiveCaseSortDir)
            ? (searchParams.sortDir as PreventiveCaseSortDir)
            : "desc",
    };
}

function buildOrderBy(query: PreventiveCaseQuery): Prisma.PreventiveCaseOrderByWithRelationInput {
    if (query.sortBy === "code") {
        return { code: query.sortDir };
    }

    if (query.sortBy === "status") {
        return { status: query.sortDir };
    }

    if (query.sortBy === "openedAt") {
        return { openedAt: query.sortDir };
    }

    if (query.sortBy === "patient") {
        return {
            patient: {
                firstName: query.sortDir,
            },
        };
    }

    if (query.sortBy === "template") {
        return {
            templateVersion: {
                template: {
                    name: query.sortDir,
                },
            },
        };
    }

    return { openedAt: "desc" };
}

export default async function PreventiveCasesPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const tenantId = await requireTenantId();
    const resolvedSearchParams = await searchParams;
    const query = parseQuery(resolvedSearchParams);

    const where: Prisma.PreventiveCaseWhereInput = {
        tenantId,
        ...(query.status ? { status: query.status } : {}),
        ...(query.q
            ? {
                  OR: [
                      {
                          code: {
                              contains: query.q,
                              mode: "insensitive",
                          },
                      },
                      {
                          patient: {
                              OR: [
                                  {
                                      firstName: {
                                          contains: query.q,
                                          mode: "insensitive",
                                      },
                                  },
                                  {
                                      lastName: {
                                          contains: query.q,
                                          mode: "insensitive",
                                      },
                                  },
                                  {
                                      organizationName: {
                                          contains: query.q,
                                          mode: "insensitive",
                                      },
                                  },
                              ],
                          },
                      },
                      {
                          templateVersion: {
                              template: {
                                  name: {
                                      contains: query.q,
                                      mode: "insensitive",
                                  },
                              },
                          },
                      },
                  ],
              }
            : {}),
    };

    const [totalItems, cases] = await Promise.all([
        prisma.preventiveCase.count({ where }),

        prisma.preventiveCase.findMany({
            where,
            orderBy: buildOrderBy(query),
            skip: (query.page - 1) * query.pageSize,
            take: query.pageSize,
            select: {
                id: true,
                code: true,
                status: true,
                openedAt: true,
                completedAt: true,
                cancelledAt: true,
                patient: {
                    select: {
                        firstName: true,
                        lastName: true,
                        organizationName: true,
                    },
                },
                templateVersion: {
                    select: {
                        template: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                providerProfile: {
                    select: {
                        partner: {
                            select: {
                                firstName: true,
                                lastName: true,
                                organizationName: true,
                            },
                        },
                    },
                },
            },
        }),
    ]);

    const items = cases.map((item) => ({
        id: item.id,
        code: item.code,
        status: item.status,
        openedAt: item.openedAt,
        completedAt: item.completedAt,
        cancelledAt: item.cancelledAt,
        patientName: getPartnerName(item.patient),
        templateName: item.templateVersion.template.name,
        providerName: item.providerProfile
            ? getPartnerName(item.providerProfile.partner)
            : null,
    }));

    const totalPages = Math.max(1, Math.ceil(totalItems / query.pageSize));

    return (
        <div className="w-full">
            <PreventiveCasesHeader />

            <PreventiveCasesFilters query={query} />

            <PreventiveCasesTable items={items} query={query} />

            <PreventiveCasesPagination
                query={query}
                totalItems={totalItems}
                totalPages={totalPages}
            />
        </div>
    );
}