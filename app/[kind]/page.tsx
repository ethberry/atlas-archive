import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { notFound } from "next/navigation";

import { CatalogScreen } from "@/components/archive/CatalogScreen";
import { isKind } from "@/lib/archive/kinds";
import { catalogKey, parseCatalogQuery } from "@/lib/archive/query";
import { readCatalog } from "@/lib/archive/read";
import { createArchiveClient } from "@/lib/db/supabase.server";
import { getQueryClient } from "@/lib/query-client";

type Search = Record<string, string | string[] | undefined>;

export default async function KindPage(props: {
  params: Promise<{ kind: string }>;
  searchParams: Promise<Search>;
}) {
  const { kind: kindParam } = await props.params;
  if (!isKind(kindParam)) {
    notFound();
  }
  const raw = await props.searchParams;
  const query = parseCatalogQuery([kindParam], raw);
  const queryClient = getQueryClient();
  const supabase = await createArchiveClient();
  if (supabase) {
    await queryClient.prefetchQuery({
      queryKey: catalogKey(query),
      queryFn: () => readCatalog(supabase, query),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CatalogScreen pathname={`/${kindParam}`} query={query} heading />
    </HydrationBoundary>
  );
}
