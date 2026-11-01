import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RecordScreen } from "@/components/archive/RecordScreen";
import { childKinds, isRecordKind, KIND_TITLES } from "@/lib/archive/kinds";
import { catalogKey, parseCatalogQuery } from "@/lib/archive/query";
import { readCatalog, readRecord } from "@/lib/archive/read";
import { createArchiveClient } from "@/lib/db/supabase.server";
import { getQueryClient } from "@/lib/query-client";

type Search = Record<string, string | string[] | undefined>;

export async function generateMetadata(props: {
  params: Promise<{ kind: string; id: string }>;
}): Promise<Metadata> {
  const { kind, id } = await props.params;
  if (!isRecordKind(kind)) {
    return {};
  }
  const supabase = await createArchiveClient();
  const record = supabase ? await readRecord(supabase, kind, id) : null;
  if (!record) {
    return {};
  }
  const title = KIND_TITLES[kind].one;
  return {
    title: `${record.name}, No Man's Sky ${title.toLowerCase()} — Atlas Archive`,
    description: `${record.name}: a ${title.toLowerCase()} of No Man's Sky, with where to find it.`,
    alternates: { canonical: `/${kind}/${id}` },
  };
}

export default async function RecordPage(props: {
  params: Promise<{ kind: string; id: string }>;
  searchParams: Promise<Search>;
}) {
  const { kind: kindParam, id } = await props.params;
  if (!isRecordKind(kindParam)) {
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
