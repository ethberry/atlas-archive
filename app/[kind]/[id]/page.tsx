import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RecordScreen } from "@/components/archive/RecordScreen";
import { StructuredData } from "@/components/archive/StructuredData";
import { childKinds, isRecordKind } from "@/lib/archive/kinds";
import { catalogKey, parseCatalogQuery } from "@/lib/archive/query";
import {
  readCatalog,
  readRecord,
  type AssetCard,
  type TrailStep,
} from "@/lib/archive/read";
import en from "@/lib/i18n/en.json";
import { createArchiveClient } from "@/lib/db/supabase.server";
import { trailData, type PageStep } from "@/lib/archive/trail";
import { getQueryClient } from "@/lib/query-client";

type Search = Record<string, string | string[] | undefined>;

// The value of a term field, in the words of the site.
function termOf(record: AssetCard, label: string): string | null {
  const field = record.fields.find((one) => one.label === label);
  if (!field || field.type !== "term" || !field.value) {
    return null;
  }
  const group = (en as Record<string, unknown>)[field.group] as
    Record<string, string> | undefined;
  return group?.[field.value] ?? field.value;
}

function stepOf(record: AssetCard, kind: TrailStep["kind"]) {
  return record.trail.find((step) => step.kind === kind)?.name ?? null;
}

// "on Burgh V in the Iroish system of Dugnowarilda Galaxy", from what the
// trail holds.
function placeOf(record: AssetCard) {
  const planet = stepOf(record, "planet");
  const system = stepOf(record, "system");
  const galaxy = stepOf(record, "galaxy");
  const parts = [
    planet
      ? `on ${planet}`
      : stepOf(record, "building")
        ? "at the space station"
        : null,
    system ? `in the ${system} system` : null,
    galaxy ? `of ${galaxy}` : null,
  ];
  return parts.filter(Boolean).join(" ");
}

// A record's title and description, in the words players search.
function recordMeta(record: AssetCard): { title: string; description: string } {
  const { name } = record;
  const place = placeOf(record);
  const rank = termOf(record, "archive.rank");
  const classWord = rank ? `class ${rank} ` : "";
  const glyphs = "with the portal glyphs and coordinates to get there";
  switch (record.kind) {
    case "tool": {
      const head = termOf(record, "archive.headItem");
      const what = head
        ? `${classWord}${head} staff`
        : `${classWord}${termOf(record, "archive.toolBody") ?? ""} multitool`;
      return {
        title: `${name}: ${what}`,
        description: `${name} is a ${what} of No Man's Sky with four adjacent supercharged slots at class S, ${place}, ${glyphs}.`,
      };
    }
    case "ship": {
      const hull = termOf(record, "archive.hull");
      const what =
        hull === "Interceptor"
          ? `${classWord}Sentinel Interceptor`
          : `${classWord}${hull ?? ""} crashed ship`;
      return {
        title: `${name}: ${what}`,
        description: `${name} is a ${what} of No Man's Sky with four adjacent supercharged slots, ${place}, ${glyphs}.`,
      };
    }
    case "creature": {
      const allS = [
        "archive.combat",
        "archive.agility",
        "archive.health",
      ].every((label) => termOf(record, label) === "S");
      const what = allS ? "all-S creature" : "creature";
      const planet = stepOf(record, "planet");
      return {
        title: planet ? `${name}: ${what} on ${planet}` : `${name}: ${what}`,
        description: `${name} is a${allS ? "n" : ""} ${what} to adopt in No Man's Sky, ${place}, ${glyphs}.`,
      };
    }
    case "planet":
      return {
        title: `${name}: planet of the ${stepOf(record, "system") ?? ""} system`,
        description: `${name}, a planet ${place} in No Man's Sky: biome, Sentinels, resources, and the multitools, crashed ships, and creatures it holds.`,
      };
    case "building": {
      const system = stepOf(record, "system") ?? name;
      return {
        title: `${system} space station`,
        description: `The space station of the ${system} system in No Man's Sky, and any listed multitool its weapon cabinets sell.`,
      };
    }
    case "system":
      return {
        title: `${name} system: multitools and crashed ships`,
        description: `The ${name} star system ${place} in No Man's Sky: its star, economy, and space station, and the planets with their multitools and crashed ships.`,
      };
    case "galaxy":
      return {
        title: name,
        description: `${name}, a${termOf(record, "archive.galaxyType") === "Empty" ? "n" : ""} ${termOf(record, "archive.galaxyType") ?? ""} galaxy of No Man's Sky, and the star systems listed in it.`,
      };
  }
}

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
  const meta = recordMeta(record);
  return {
    title: `${meta.title} in No Man's Sky — Atlas Archive`,
    description: meta.description,
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
  let trail: PageStep[] | null = null;
  if (supabase) {
    const record = await readRecord(supabase, kindParam, id);
    if (!record) {
      notFound();
    }
    trail = [
      { name: "Home", href: "/" },
      ...record.trail.map((step) => ({
        name: step.name,
        href: `/${step.kind}/${step.id}`,
      })),
      { name: record.name },
    ];
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
      {trail ? <StructuredData data={trailData(trail)} /> : null}
      <RecordScreen
        kind={kindParam}
        id={id}
        pathname={`/${kindParam}/${id}`}
        query={query}
      />
    </HydrationBoundary>
  );
}
