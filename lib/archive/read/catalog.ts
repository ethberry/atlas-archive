import { STATION_BUILDING, PAGE_SIZE, type Kind } from "@/lib/archive/kinds";
import type { CatalogQuery } from "@/lib/archive/query";
import {
  type ArchiveClient,
  type CatalogRow,
  type CatalogPage,
  contains,
  fail,
  likedSet,
  toRows,
  stationName,
} from "@/lib/archive/read/common";

export async function readCatalog(
  supabase: ArchiveClient,
  query: CatalogQuery,
): Promise<CatalogPage> {
  const from = (query.page - 1) * PAGE_SIZE;
  const to = query.counted ? from + PAGE_SIZE - 1 : from + PAGE_SIZE;
  let request = supabase
    .from("assets")
    .select(
      [
        listSelect(query),
        ...(query.ancestorId ? [BELOW] : []),
        ...(query.likedBy ? [LIKED] : []),
      ].join(", "),
      query.counted ? { count: "exact" } : undefined,
    )
    .in("kind", query.kinds)
    .order("name", { ascending: true })
    .order("id", { ascending: true })
    .range(from, to);

  if (query.parentId) {
    request = request.eq("parent_id", query.parentId);
  }
  if (query.ancestorId) {
    request = request.eq("asset_ancestors.ancestor_id", query.ancestorId);
  }
  if (query.likedBy) {
    request = request.eq("likes.user_id", query.likedBy);
  }
  if (query.name) {
    request = request.ilike("name", contains(query.name));
  }
  request = applyFilters(request, query);

  const { data, error, count } = await request;
  if (error) {
    fail(error);
  }
  const parsed = toRows(data, new Set());
  const pageRows = query.counted ? parsed : parsed.slice(0, PAGE_SIZE);
  if (query.parentId && query.kinds[0] === "planet" && query.page === 1) {
    pageRows.unshift(...(await stationRows(supabase, query.parentId)));
  }
  const liked = await likedSet(
    supabase,
    pageRows.map((row) => row.id),
  );
  return {
    rows: pageRows.map((row) => ({ ...row, liked: liked.has(row.id) })),
    total: query.counted ? (count ?? 0) : null,
    hasNext: query.counted ? false : parsed.length > PAGE_SIZE,
  };
}

// The row of a system's space station, first in the list of its planets. Only
// a station with a tool to show has one.
async function stationRows(
  supabase: ArchiveClient,
  systemId: string,
): Promise<CatalogRow[]> {
  const { data, error } = await supabase
    .from("assets")
    .select("id, kind, name, like_count")
    .eq("parent_id", systemId)
    .eq("kind", "building")
    .eq("name", STATION_BUILDING);
  if (error) {
    fail(error);
  }
  const { data: system, error: systemError } = await supabase
    .from("assets")
    .select("name")
    .eq("id", systemId)
    .maybeSingle();
  if (systemError) {
    fail(systemError);
  }
  const name = stationName(system?.name ?? "");
  return toRows(data, new Set()).map((row) => ({ ...row, name }));
}

function listSelect(query: CatalogQuery): string {
  if (query.kinds.length !== 1) {
    return "id, kind, name, like_count";
  }
  switch (query.kinds[0]) {
    case "system":
      return "id, kind, name, like_count, systems!inner(star, station, dissonance, gas_giant)";
    case "planet":
      return "id, kind, name, like_count, bodies!inner(biome, sentinels, dissonance)";
    case "ship":
      return "id, kind, name, like_count, ships!inner(hull, class)";
    case "tool":
      return "id, kind, name, like_count, tools!inner(body, class)";
    case "galaxy":
      return "id, kind, name, like_count, galaxies!inner(id)";
    case "creature":
      return "id, kind, name, like_count, creatures!inner(combat, agility, health)";
    default:
      return "id, kind, name, like_count";
  }
}

function applyFilters<T extends Filterable<T>>(
  request: T,
  query: CatalogQuery,
): T {
  let next = request;
  const kinds = query.kinds;
  if (query.star && kinds.includes("system")) {
    next = next.eq("systems.star", query.star);
  }
  if (query.station && kinds.includes("system")) {
    next = next.eq("systems.station", query.station);
  }
  if (query.biome && kinds.includes("planet")) {
    next = next.eq("bodies.biome", Number(query.biome));
  }
  if (query.sentinels && kinds.includes("planet")) {
    next = next.eq("bodies.sentinels", query.sentinels);
  }
  if (query.dissonance && kinds.includes("system")) {
    next = next.eq("systems.dissonance", true);
  }
  if (query.dissonance && kinds.includes("planet")) {
    next = next.eq("bodies.dissonance", true);
  }
  if (query.gasGiant && kinds.includes("system")) {
    next = next.eq("systems.gas_giant", true);
  }
  if (query.hull && kinds.includes("ship")) {
    next = next.eq("ships.hull", query.hull);
  }
  if (query.rank && kinds.includes("ship")) {
    next = next.eq("ships.class", query.rank);
  }
  if (query.rank && kinds.includes("tool")) {
    next = next.eq("tools.class", query.rank);
  }
  if (query.toolBody && kinds.includes("tool")) {
    next = next.eq("tools.body", query.toolBody);
  }
  return next;
}

type Filterable<T> = {
  eq: (column: string, value: string | number | boolean) => T;
};

// Joins a record to its ancestors, to pick the records below one record at
// any depth in a single request.
const BELOW =
  "asset_ancestors!asset_ancestors_asset_id_fkey!inner(ancestor_id)";

// Joins an item to its likes. A player reads only their own rows.
const LIKED = "likes!inner(user_id)";

// Where a tabbed list starts: below a record, or a player's likes.
export type ItemAnchor = { ancestorId: string } | { likedBy: string };

// How many items of one kind an anchor holds. The rows are not read.
export async function countItems(
  supabase: ArchiveClient,
  anchor: ItemAnchor,
  kind: Kind,
): Promise<number> {
  const request = supabase
    .from("assets")
    .select(`id, ${"ancestorId" in anchor ? BELOW : LIKED}`, {
      count: "exact",
      head: true,
    })
    .eq("kind", kind);
  const { count, error } = await ("ancestorId" in anchor
    ? request.eq("asset_ancestors.ancestor_id", anchor.ancestorId)
    : request.eq("likes.user_id", anchor.likedBy));
  if (error) {
    fail(error);
  }
  return count ?? 0;
}
