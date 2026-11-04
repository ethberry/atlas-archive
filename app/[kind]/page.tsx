import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatalogScreen } from "@/components/archive/CatalogScreen";
import { PageTrail } from "@/components/archive/PageTrail";
import { StructuredData } from "@/components/archive/StructuredData";
import { CATALOG_PAGES, isKind, KIND_TITLES } from "@/lib/archive/kinds";
import { catalogKey, parseCatalogQuery } from "@/lib/archive/query";
import { readCatalog } from "@/lib/archive/read";
import { createArchiveClient } from "@/lib/db/supabase.server";
import { trailData } from "@/lib/archive/trail";
import { getQueryClient } from "@/lib/query-client";

type Search = Record<string, string | string[] | undefined>;

export async function generateMetadata(props: {
  params: Promise<{ kind: string }>;
}): Promise<Metadata> {
  const { kind } = await props.params;
  if (!isKind(kind)) {
    return {};
  }
  const page = CATALOG_PAGES[kind];
  return {
    title: `${page.title} — Atlas Archive`,
    description: page.description,
    alternates: { canonical: `/${kind}` },
  };
}

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

  const trail = [
    { name: "Home", href: "/" },
    { name: KIND_TITLES[kindParam].many },
  ];
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StructuredData data={trailData(trail)} />
      <PageTrail steps={trail} />
      <CatalogScreen pathname={`/${kindParam}`} query={query} heading />
    </HydrationBoundary>
  );
}
