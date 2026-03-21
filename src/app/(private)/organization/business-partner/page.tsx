import { listBusinessPartnersAction } from "@/action/business-partner/list-business-partner";
import { BusinessPartnerListShell } from "@/components/private/organizations/business-partner/business-partner-list-shell";
import { businessPartnerFiltersSchema } from "@/lib/zod/private/organization/business-partner/business-partner-filters.schema";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BusinessPartnerPage({ searchParams }: Props) {
  const raw = (await searchParams) ?? {};
  const parsed = businessPartnerFiltersSchema.parse(raw);
  const data = await listBusinessPartnersAction(parsed);

  return (
    <BusinessPartnerListShell
      items={data.items}
      totalItems={data.totalItems}
      page={data.page}
      pageSize={data.pageSize}
      totalPages={data.totalPages}
      query={parsed}
    />
  );
}