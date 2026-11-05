import type { MetadataRoute } from "next";

import { GUIDE_MENU, pathShown } from "@/lib/archive/features";
import { FEED_KINDS, STATION_BUILDING } from "@/lib/archive/kinds";
import { TOPICS } from "@/lib/archive/statistics";
import { createArchiveClient } from "@/lib/db/supabase.server";
import { groupPath, guidePath } from "@/lib/archive/guides";

const BATCH = 1000;
// The showcase star's galaxy stays off the map: a reader finds it, Google does not.
const HIDDEN_GALAXY = "galaxy:245";

// Every record under a galaxy other than the hidden one.
async function recordEntries(base: string): Promise<MetadataRoute.Sitemap> {
  const supabase = await createArchiveClient();
  if (!supabase) {
    return [];
  }
  const rows: {
    id: string;
    kind: string;
    name: string;
    locator: string | null;
    parent_id: string | null;
  }[] = [];
  for (let from = 0; ; from += BATCH) {
    const { data, error } = await supabase
      .from("assets")
      .select("id, kind, name, locator, parent_id")
      .order("id")
      .range(from, from + BATCH - 1);
    if (error) {
      throw error;
    }
    rows.push(...data);
    if (data.length < BATCH) {
      break;
    }
  }
  const parentOf = new Map(rows.map((row) => [row.id, row.parent_id]));
  const hidden = rows.find((row) => row.locator === HIDDEN_GALAXY)?.id;
  const isHidden = (id: string) => {
    for (let at: string | null = id; at; at = parentOf.get(at) ?? null) {
      if (at === hidden) {
        return true;
      }
    }
    return false;
  };
  // A galaxy with nothing listed is an empty page.
  const parents = new Set(rows.map((row) => row.parent_id));
  return rows
    .filter((row) => !isHidden(row.id))
    .filter((row) => row.kind !== "galaxy" || parents.has(row.id))
    .filter((row) => row.kind !== "building" || row.name === STATION_BUILDING)
    .map((row) => ({
      url: `${base}/${row.kind}/${row.id}`,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${base}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    // The finders, while their feature flag is on.
    ...["/interceptor-finder", "/capital-freighter-finder", "/freighter-finder"]
      .filter((path) => pathShown(path))
      .map((path) => ({
        url: `${base}${path}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    // Hidden until 3.0 while the feature flag is off.
    ...(pathShown("/living-ship-finder")
      ? [
          {
            url: `${base}/living-ship-finder`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.6,
          },
        ]
      : []),
    {
      url: `${base}/how-lucky-am-i`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/guides`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...GUIDE_MENU.map((group) => ({
      url: `${base}${groupPath(group.slug)}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...TOPICS.map((topic) => ({
      url: `${base}${guidePath(topic.slug)}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    {
      url: `${base}/release-notes`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${base}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...FEED_KINDS.map((kind) => ({
      url: `${base}/${kind}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...(await recordEntries(base)),
  ];
}
