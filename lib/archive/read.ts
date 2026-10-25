import type { SupabaseClient } from "@supabase/supabase-js";

import { featuredIds } from "@/lib/archive/featured";
import {
  FEED_KINDS,
  HOME_LIMIT,
  PAGE_SIZE,
  type Kind,
} from "@/lib/archive/kinds";
import type { CatalogQuery } from "@/lib/archive/query";
import { kindSchema, listRowSchema, slotSchema } from "@/lib/archive/schema";
import type { Database } from "@/lib/db/supabase.types";

const UNAVAILABLE = "The archive could not be read.";

export type ArchiveClient = SupabaseClient<Database>;

export type CatalogRow = {
  id: string;
  kind: Kind;
  name: string;
  likeCount: number;
  liked: boolean;
};

export type CatalogPage = {
  rows: CatalogRow[];
  total: number | null;
  hasNext: boolean;
};

export type Field =
  | { type: "text"; label: string; text: string | null }
  | { type: "term"; label: string; group: string; value: string | null }
  | { type: "flag"; label: string; value: boolean | null };

export type AssetCard = {
  id: string;
  kind: Kind;
  name: string;
  likeCount: number;
  liked: boolean;
  fields: Field[];
};

export type FeedSection = "featured" | "top" | "latest";

type AssetHead = {
  id: string;
  kind: string;
  name: string;
  locator: string | null;
  like_count: number;
};

function contains(value: string): string {
  return `%${value.replace(/[%_\\]/g, "\\$&")}%`;
}

function fail(): never {
  throw new Error(UNAVAILABLE);
}

function slots(value: unknown): string | null {
  const parsed = slotSchema.array().safeParse(value);
  if (!parsed.success || parsed.data.length === 0) {
    return null;
  }
  return parsed.data.map(([column, row]) => `${column},${row}`).join(" · ");
}

async function likedSet(
  supabase: ArchiveClient,
  ids: string[],
): Promise<Set<string>> {
  if (ids.length === 0) {
    return new Set();
  }
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return new Set();
  }
  const { data, error } = await supabase
    .from("likes")
    .select("asset_id")
    .in("asset_id", ids);
  if (error) {
    fail();
  }
  return new Set((data ?? []).map((row) => row.asset_id));
}

function toRows(data: unknown, liked: Set<string>): CatalogRow[] {
  const parsed = listRowSchema.array().safeParse(data);
  if (!parsed.success) {
    fail();
  }
  return parsed.data.map((row) => ({
    id: row.id,
    kind: row.kind,
    name: row.name,
    likeCount: row.like_count,
    liked: liked.has(row.id),
  }));
}

export async function readCatalog(
  supabase: ArchiveClient,
  query: CatalogQuery,
): Promise<CatalogPage> {
  const from = (query.page - 1) * PAGE_SIZE;
  const to = query.counted ? from + PAGE_SIZE - 1 : from + PAGE_SIZE;
  let request = supabase
    .from("assets")
    .select(listSelect(query), query.counted ? { count: "exact" } : undefined)
    .in("kind", query.kinds)
    .order("name", { ascending: true })
    .order("id", { ascending: true })
    .range(from, to);

  if (query.parentId) {
    request = request.eq("parent_id", query.parentId);
  }
  if (query.name) {
    request = request.ilike("name", contains(query.name));
  }
  request = applyFilters(request, query);

  const { data, error, count } = await request;
  if (error) {
    fail();
  }
  const parsed = toRows(data, new Set());
  const pageRows = query.counted ? parsed : parsed.slice(0, PAGE_SIZE);
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

function listSelect(query: CatalogQuery): string {
  if (query.kinds.length !== 1) {
    return "id, kind, name, like_count";
  }
  switch (query.kinds[0]) {
    case "system":
      return "id, kind, name, like_count, systems!inner(star, station, dissonance, gas_giant)";
    case "planet":
      return "id, kind, name, like_count, bodies!inner(biome, sentinels, dissonance)";
    case "building":
      return "id, kind, name, like_count, pois!inner(building_type)";
    case "ship":
      return "id, kind, name, like_count, ships!inner(hull, class)";
    case "tool":
      return "id, kind, name, like_count, tools!inner(body, class)";
    case "galaxy":
      return "id, kind, name, like_count, galaxies!inner(id)";
    case "creature":
      return "id, kind, name, like_count, creatures!inner(helpfulness, aggression, independence)";
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
  if (query.building && kinds.includes("building")) {
    next = next.eq("pois.building_type", query.building);
  }
  return next;
}

type Filterable<T> = {
  eq: (column: string, value: string | number | boolean) => T;
};

export async function readFeed(
  supabase: ArchiveClient,
  section: FeedSection,
): Promise<CatalogRow[]> {
  if (section === "featured") {
    if (featuredIds.length === 0) {
      return [];
    }
    const { data, error } = await supabase
      .from("assets")
      .select("id, kind, name, like_count")
      .in("kind", [...FEED_KINDS])
      .in("id", [...featuredIds]);
    if (error) {
      fail();
    }
    const rows = toRows(data, new Set());
    const order = new Map(featuredIds.map((id, index) => [id, index]));
    rows.sort(
      (left, right) => (order.get(left.id) ?? 0) - (order.get(right.id) ?? 0),
    );
    return withLikes(supabase, rows);
  }

  const request = supabase
    .from("assets")
    .select("id, kind, name, like_count")
    .in("kind", [...FEED_KINDS])
    .limit(HOME_LIMIT);

  const ordered =
    section === "top"
      ? request
          .order("like_count", { ascending: false })
          .order("created_at", { ascending: false })
      : request.order("created_at", { ascending: false });

  const { data, error } = await ordered;
  if (error) {
    fail();
  }
  return withLikes(supabase, toRows(data, new Set()));
}

async function withLikes(
  supabase: ArchiveClient,
  rows: CatalogRow[],
): Promise<CatalogRow[]> {
  const liked = await likedSet(
    supabase,
    rows.map((row) => row.id),
  );
  return rows.map((row) => ({ ...row, liked: liked.has(row.id) }));
}

export async function readRecord(
  supabase: ArchiveClient,
  kind: Kind,
  id: string,
): Promise<AssetCard | null> {
  const { data, error } = await supabase
    .from("assets")
    .select(recordSelect(kind))
    .eq("id", id)
    .eq("kind", kind)
    .maybeSingle();
  if (error) {
    fail();
  }
  if (!data) {
    return null;
  }
  const parsedHead = assetHead.safeParse(data);
  if (!parsedHead.success) {
    fail();
  }
  const head = parsedHead.data;
  const liked = await likedSet(supabase, [head.id]);
  const fields = await fieldsFor(supabase, kind, head, data);
  return {
    id: head.id,
    kind,
    name: head.name,
    likeCount: head.like_count,
    liked: liked.has(head.id),
    fields,
  };
}

function recordSelect(kind: Kind): string {
  switch (kind) {
    case "galaxy":
      return "id, kind, name, locator, like_count, galaxies!inner(id)";
    case "system":
      return "id, kind, name, locator, like_count, systems!inner(*)";
    case "planet":
      return "id, kind, name, locator, like_count, bodies!inner(*)";
    case "building":
      return "id, kind, name, locator, like_count, pois!inner(*)";
    case "ship":
      return "id, kind, name, locator, like_count, ships!inner(*)";
    case "tool":
      return "id, kind, name, locator, like_count, tools!inner(*)";
    case "creature":
      return "id, kind, name, locator, like_count, creatures!inner(helpfulness, aggression, independence)";
    default:
      return "id, kind, name, locator, like_count";
  }
}

const assetHead = listRowSchema
  .pick({ id: true, name: true, like_count: true })
  .extend({
    kind: kindSchema,
    locator: zNullable(),
  });

function zNullable() {
  return listRowSchema.shape.name.nullable();
}

async function fieldsFor(
  supabase: ArchiveClient,
  kind: Kind,
  head: AssetHead,
  data: unknown,
): Promise<Field[]> {
  const record = asRecord(data);
  const fields: Field[] = [];
  if (kind === "galaxy") {
    fields.push({
      type: "text",
      label: "archive.systemsCount",
      text: String(await childCount(supabase, head.id, ["system"])),
    });
  }
  if (kind === "system") {
    const system = asRecord(record.systems);
    fields.push(
      term("archive.star", "star", text(system.star)),
      term("archive.population", "population", text(system.population)),
      term("archive.station", "station", text(system.station)),
      term("archive.economy", "economy", text(system.economy)),
      term("archive.wealth", "wealth", text(system.wealth)),
      term("archive.conflict", "conflict", text(system.conflict)),
      {
        type: "text",
        label: "archive.lightYears",
        text:
          typeof system.light_years === "number"
            ? String(system.light_years)
            : null,
      },
      flag("archive.water", bool(system.water)),
      flag("archive.dissonance", bool(system.dissonance)),
      flag("archive.gasGiant", bool(system.gas_giant)),
      {
        type: "text",
        label: "archive.planetsCount",
        text: String(await childCount(supabase, head.id, ["planet"])),
      },
    );
  }
  if (kind === "planet") {
    const body = asRecord(record.bodies);
    fields.push(
      term(
        "archive.biome",
        "biome",
        typeof body.biome === "number" ? String(body.biome) : null,
      ),
      { type: "text", label: "archive.phrase", text: text(body.phrase) },
      { type: "text", label: "archive.glyphs", text: text(body.glyphs) },
      term("archive.sentinels", "sentinel", text(body.sentinels)),
      { type: "text", label: "archive.resources", text: list(body.resources) },
      flag("archive.dissonance", bool(body.dissonance)),
      flag("archive.ancientBones", bool(body.ancient_bones)),
      flag("archive.salvage", bool(body.salvageable_scrap)),
      flag("archive.activated", bool(body.activated_stellar)),
    );
  }
  if (kind === "building") {
    const poi = asRecord(record.pois);
    fields.push(
      term("archive.buildingType", "building", text(poi.building_type)),
      { type: "text", label: "archive.face", text: numberText(poi.face) },
      { type: "text", label: "archive.cellI", text: numberText(poi.i) },
      { type: "text", label: "archive.cellJ", text: numberText(poi.j) },
    );
  }
  if (kind === "ship") {
    const ship = asRecord(record.ships);
    fields.push(
      term("archive.hull", "hull", text(ship.hull)),
      term("archive.rank", "rank", text(ship.class)),
      {
        type: "text",
        label: "archive.supercharged",
        text: slots(ship.supercharged),
      },
    );
  }
  if (kind === "tool") {
    const tool = asRecord(record.tools);
    fields.push(
      term("archive.toolBody", "toolBody", text(tool.body)),
      term("archive.rank", "rank", text(tool.class)),
      {
        type: "text",
        label: "archive.supercharged",
        text: slots(tool.supercharged),
      },
    );
  }
  if (kind === "creature") {
    const creature = asRecord(record.creatures);
    fields.push(
      term("archive.helpfulness", "rank", text(creature.helpfulness)),
      term("archive.aggression", "rank", text(creature.aggression)),
      term("archive.independence", "rank", text(creature.independence)),
    );
  }
  fields.push({ type: "text", label: "archive.locator", text: head.locator });
  return fields;
}

async function childCount(
  supabase: ArchiveClient,
  id: string,
  kinds: Kind[],
): Promise<number> {
  const { count, error } = await supabase
    .from("assets")
    .select("id", { count: "exact", head: true })
    .eq("parent_id", id)
    .in("kind", kinds);
  if (error) {
    fail();
  }
  return count ?? 0;
}

function term(label: string, group: string, value: string | null): Field {
  return { type: "term", label, group, value };
}

function flag(label: string, value: boolean | null): Field {
  return { type: "flag", label, value };
}

function asRecord(value: unknown): Record<string, unknown> {
  const target = Array.isArray(value) ? value[0] : value;
  if (!target || typeof target !== "object") {
    return {};
  }
  return Object.fromEntries(
    Object.entries(target).map(([key, item]) => [key, item as unknown]),
  );
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function bool(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function numberText(value: unknown): string | null {
  return typeof value === "number" ? String(value) : null;
}

function list(value: unknown): string | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }
  const items = value.filter(
    (item): item is string => typeof item === "string",
  );
  return items.length > 0 ? items.join(", ") : null;
}
