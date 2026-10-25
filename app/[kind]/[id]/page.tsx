import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { notFound } from "next/navigation";

import { RecordScreen } from "@/components/archive/RecordScreen";
import { childKinds, isKind } from "@/lib/archive/kinds";
import { catalogKey, parseCatalogQuery } from "@/lib/archive/query";
import { readCatalog, readRecord } from "@/lib/archive/read";
import { createArchiveClient } from "@/lib/db/supabase.server";
import { getQueryClient } from "@/lib/query-client";

type Search = Record<string, string | string[] | undefined>;

export default async function RecordPage(props: {
  params: Promise<{ kind: string; id: string }>;
  searchParams: Promise<Search>;
}) {
  const { kind: kindParam, id } = await props.params;
  if (!isKind(kindParam)) {
    notFound();
  }
  const children = childKinds(kindParam);
  const raw = await props.searchParams;
  const query = parseCatalogQuery(
    children.length > 0 ? children : [kindParam],
    raw,
    id,
  );
  const queryClient = getQueryClient();
  const supabase = await createArchiveClient();
  if (supabase) {
    const record = await readRecord(supabase, kindParam, id);
    if (!record) {
      notFound();
    }
    queryClient.setQueryData(["record", kindParam, id], record);
    if (children.length > 0) {
      await queryClient.prefetchQuery({
        queryKey: catalogKey(query),
        queryFn: () => readCatalog(supabase, query),
      });
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RecordScreen
        kind={kindParam}
        id={id}
        pathname={`/${kindParam}/${id}`}
        query={query}
      />
    </HydrationBoundary>
  );
}
