import type { SupabaseClient } from "@supabase/supabase-js";

import { galaxyIndex, portalGlyphs } from "@/lib/archive/address";
import {
  STATION_BUILDING,
  FEED_KINDS,
  KINDS,
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
  // The card picture of a home-page row; null shows the placeholder.
  image?: string | null;
};

export type CatalogPage = {
  rows: CatalogRow[];
  total: number | null;
  hasNext: boolean;
};

export type Field =
  | { type: "text"; label: string; text: string | null }
  | { type: "steps"; label: string; glyphs: string | null; steps: Step[] }
  | { type: "glyphs"; label: string; glyphs: string | null }
  | {
      type: "slots";
      label: string;
      width: number;
      height: number;
      cells: SlotCell[];
    }
  | { type: "term"; label: string; group: string; value: string | null }
  | { type: "terms"; label: string; group: string; values: string[] }
  | { type: "flag"; label: string; value: boolean | null };

// One supercharged cell and the class at which it is open.
export type SlotCell = { column: number; row: number; rank: string };

export type AssetCard = {
  id: string;
  kind: Kind;
  name: string;
  likeCount: number;
  liked: boolean;
  // Checked in the game; set by hand in the database. Null for kinds that
  // carry no mark.
  verified: boolean | null;
  // The record's pictures; none shows the placeholder.
  images: string[];
  // Whether a player can add a screenshot to this record.
  uploadable: boolean;
  // The records above this one, from the galaxy down.
  trail: TrailStep[];
  fields: Field[];
};

export type TrailStep = { id: string; kind: Kind; name: string };

// Galaxies with a picture in public/assets/img/galaxies, by index.
const GALAXY_IMAGES = new Set([0, 1, 2, 6, 9, 245]);

export function galaxyImage(index: unknown): string | null {
  return typeof index === "number" && GALAXY_IMAGES.has(index)
    ? `/assets/img/galaxies/${index}.jpg`
    : null;
}

export type FeedSection = "galaxies" | "top" | "latest";

const FEATURED_GALAXIES = 4;

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

const RANKS = ["C", "B", "A", "S"];

// One grid for ships and multitools: the full 10 by 6 inventory. Supercharged
// cells are drawn inside a smaller rectangle of it, 10 by 3 for a ship and 7
// by 4 for a multitool.
const GRID_WIDTH = 10;
const GRID_HEIGHT = 6;

// The cells at S on a grid. The natural cells are open at the class the item
// was found with; each further cell opens one class later, in the order the
// upgrade adds them (C, B, A, S).
function slotGrid(atS: unknown, natural: unknown, found: string | null): Field {
  const all = slotSchema.array().safeParse(atS);
  const first = slotSchema.array().safeParse(natural);
  const start = Math.max(RANKS.indexOf(found ?? ""), 0);
  const known = first.success ? first.data : [];
  const cells: SlotCell[] = (all.success ? all.data : []).map(
    ([column, row]) => {
      const extra = all.success
        ? all.data
            .filter(([c, r]) => !known.some(([kc, kr]) => kc === c && kr === r))
            .findIndex(([c, r]) => c === column && r === row)
        : -1;
      return {
        column,
        row,
        rank: RANKS[Math.min(extra < 0 ? start : start + 1 + extra, 3)],
      };
    },
  );
  return {
    type: "slots",
    label: "archive.supercharged",
    width: Math.max(GRID_WIDTH, ...cells.map((cell) => cell.column + 1)),
    height: Math.max(GRID_HEIGHT, ...cells.map((cell) => cell.row + 1)),
    cells,
  };
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
    fail();
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
    fail();
  }
  const { data: system, error: systemError } = await supabase
    .from("assets")
    .select("name")
    .eq("id", systemId)
    .maybeSingle();
  if (systemError) {
    fail();
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
    fail();
  }
  return count ?? 0;
}

// Cards in a home-page block other than the galaxies.
const FEED_SIZE = 12;

async function readGalaxies(supabase: ArchiveClient): Promise<CatalogRow[]> {
  const { data, error } = await supabase
    .from("assets")
    .select("id, kind, name, like_count, galaxies!inner(featured, index)")
    .eq("kind", "galaxy")
    .not("galaxies.featured", "is", null)
    .limit(FEATURED_GALAXIES);
  if (error) {
    fail();
  }
  const order = new Map(
    (data ?? []).map((row) => [row.id, asRecord(row.galaxies).featured]),
  );
  const index = new Map(
    (data ?? []).map((row) => [row.id, asRecord(row.galaxies).index]),
  );
  const rows = toRows(data, new Set()).map((row) => ({
    ...row,
    image: galaxyImage(index.get(row.id)),
  }));
  rows.sort(
    (left, right) =>
      Number(order.get(left.id) ?? 0) - Number(order.get(right.id) ?? 0),
  );
  return rows;
}

export async function readFeed(
  supabase: ArchiveClient,
  section: FeedSection,
): Promise<CatalogRow[]> {
  if (section === "galaxies") {
    return readGalaxies(supabase);
  }
  const request = supabase
    .from("assets")
    .select("id, kind, name, like_count")
    .in("kind", [...FEED_KINDS])
    .limit(FEED_SIZE);

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
  return withImages(
    supabase,
    await withLikes(supabase, toRows(data, new Set())),
  );
}

// The first checked screenshot of each row, for the home-page cards.
async function withImages(
  supabase: ArchiveClient,
  rows: CatalogRow[],
): Promise<CatalogRow[]> {
  const { data, error } = await supabase
    .from("asset_images")
    .select("asset_id, object_path")
    .in(
      "asset_id",
      rows.map((row) => row.id),
    )
    .eq("is_verified", true)
    .order("created_at", { ascending: true });
  if (error) {
    fail();
  }
  const first = new Map<string, string>();
  for (const row of data ?? []) {
    if (!first.has(row.asset_id)) {
      first.set(row.asset_id, row.object_path);
    }
  }
  if (first.size === 0) {
    return rows;
  }
  const signed = await supabase.storage
    .from("screenshots")
    .createSignedUrls([...first.values()], 3600);
  const links = new Map(
    (signed.data ?? []).map((row) => [row.path, row.signedUrl]),
  );
  return rows.map((row) => ({
    ...row,
    image: links.get(first.get(row.id) ?? "") ?? null,
  }));
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
  if (kind === "building" && head.name !== STATION_BUILDING) {
    return null;
  }
  const liked = await likedSet(supabase, [head.id]);
  const chain = chainOf(data);
  const fields = await fieldsFor(supabase, kind, head, data, chain);
  return {
    id: head.id,
    kind,
    name: kind === "building" ? stationTitle(chain) : head.name,
    likeCount: head.like_count,
    liked: liked.has(head.id),
    verified: verifiedFlag(kind, data),
    images:
      kind === "galaxy"
        ? [galaxyImage(asRecord(asRecord(data).galaxies).index)].filter(
            (image) => image !== null,
          )
        : await verifiedImages(supabase, kind, head.id),
    uploadable: UPLOADABLE.has(kind),
    trail: chain
      .filter(
        (step) =>
          step.id !== head.id &&
          (step.kind !== "building" || step.name === STATION_BUILDING),
      )
      .sort(
        (left, right) => KINDS.indexOf(left.kind) - KINDS.indexOf(right.kind),
      )
      .map(({ id, kind: stepKind, name }) => ({
        id,
        kind: stepKind,
        name: stepKind === "building" ? stationTitle(chain) : name,
      })),
    fields,
  };
}

// A station has the name of its system.
function stationName(system: string): string {
  return `${system} (Station)`;
}

function stationTitle(chain: ChainStep[]): string {
  return stationName(above(chain, "system")?.name ?? "");
}

const UPLOADABLE = new Set<Kind>(["ship", "tool", "creature"]);

// The checked screenshots of an item, oldest first, as links that last an
// hour.
async function verifiedImages(
  supabase: ArchiveClient,
  kind: Kind,
  id: string,
): Promise<string[]> {
  if (!UPLOADABLE.has(kind)) {
    return [];
  }
  const { data, error } = await supabase
    .from("asset_images")
    .select("object_path")
    .eq("asset_id", id)
    .eq("is_verified", true)
    .order("created_at", { ascending: true });
  if (error) {
    fail();
  }
  const paths = (data ?? []).map((row) => row.object_path);
  if (paths.length === 0) {
    return [];
  }
  const signed = await supabase.storage
    .from("screenshots")
    .createSignedUrls(paths, 3600);
  return (signed.data ?? []).flatMap((row) =>
    row.signedUrl ? [row.signedUrl] : [],
  );
}

// The verified flag of a tool, a ship, or a creature.
function verifiedFlag(kind: Kind, data: unknown): boolean | null {
  const table =
    kind === "tool"
      ? "tools"
      : kind === "ship"
        ? "ships"
        : kind === "creature"
          ? "creatures"
          : null;
  if (!table) {
    return null;
  }
  return asRecord(asRecord(data)[table]).verified === true;
}

// Every record above a record, with the coordinates of a point among them,
// so a card needs no walk up its parents.
const CHAIN =
  "asset_ancestors!asset_ancestors_asset_id_fkey(assets!asset_ancestors_ancestor_id_fkey(id, kind, name, locator, pois!pois_id_fkey(latitude, longitude, building_type)))";

// The points that give an item, and the planet its save is loaded on.
const LINKS =
  "poi_items!poi_items_item_id_fkey(entry_station, pois(latitude, longitude, building_type), bodies!poi_items_entry_planet_fkey(assets!bodies_id_fkey(locator)))";

const RECORD_HEAD = "id, kind, name, locator, like_count";

function recordSelect(kind: Kind): string {
  switch (kind) {
    case "galaxy":
      return `${RECORD_HEAD}, galaxies!inner(*)`;
    case "system":
      return `${RECORD_HEAD}, systems!inner(*), ${CHAIN}`;
    case "planet":
      return `${RECORD_HEAD}, bodies!inner(*), ${CHAIN}`;
    case "ship":
      return `${RECORD_HEAD}, ships!inner(*), ${CHAIN}, ${LINKS}`;
    case "tool":
      return `${RECORD_HEAD}, tools!inner(*), ${CHAIN}, ${LINKS}`;
    case "creature":
      return `${RECORD_HEAD}, creatures!inner(*), ${CHAIN}`;
    case "building":
      return `${RECORD_HEAD}, ${CHAIN}`;
    default:
      return RECORD_HEAD;
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
  chain: ChainStep[],
): Promise<Field[]> {
  const record = asRecord(data);
  const fields: Field[] = [];
  if (kind === "galaxy") {
    const galaxy = asRecord(record.galaxies);
    fields.push(
      {
        type: "text",
        label: "archive.galaxyIndex",
        text: numberText(galaxy.index),
      },
      term("archive.galaxyType", "galaxyType", text(galaxy.type)),
    );
    fields.push({
      type: "text",
      label: "archive.systemsCount",
      text: String(await childCount(supabase, head.id, ["system"])),
    });
  }
  if (kind === "system") {
    const system = asRecord(record.systems);
    fields.push(
      {
        type: "text",
        label: "archive.galaxy",
        text: above(chain, "galaxy")?.name ?? null,
      },
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
          // The distance to the galaxy core, in light years as the game
          // prints it.
          typeof system.light_years === "number"
            ? `${system.light_years.toLocaleString("en-US")} ly`
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
  if (kind === "building") {
    fields.push(
      {
        type: "text",
        label: "archive.galaxy",
        text: above(chain, "galaxy")?.name ?? null,
      },
      {
        type: "text",
        label: "archive.system",
        text: above(chain, "system")?.name ?? null,
      },
    );
  }
  if (kind === "planet") {
    const body = asRecord(record.bodies);
    fields.push(
      ...whereIs(chain, null),
      // The planet as a whole, then its hazards, then what it holds.
      term(
        "archive.biome",
        "biome",
        typeof body.biome === "number" ? String(body.biome) : null,
      ),
      flag("archive.gasGiant", bool(body.gas_giant)),
      flag("archive.water", bool(body.water)),
      term("archive.sentinels", "sentinel", text(body.sentinels)),
      flag("archive.dissonance", bool(body.dissonance)),
      terms("archive.resources", "resource", body.resources),
      flag("archive.activated", bool(body.activated_stellar)),
      flag("archive.ancientBones", bool(body.ancient_bones)),
      flag("archive.salvage", bool(body.salvageable_scrap)),
    );
  }
  if (kind === "ship") {
    const ship = asRecord(record.ships);
    fields.push(
      ...itemRoute(chain, linksOf(data)),
      term("archive.hull", "hull", text(ship.hull)),
      term("archive.rank", "rank", text(ship.class)),
      slotGrid(
        ship.supercharged,
        ship.natural_supercharged ?? ship.supercharged,
        text(ship.class),
      ),
      ...shipStats(ship),
    );
  }
  if (kind === "tool") {
    const tool = asRecord(record.tools);
    const headItem = text(tool.head_item);
    fields.push(
      ...itemRoute(chain, linksOf(data)),
      term("archive.toolBody", "toolBody", text(tool.body)),
      ...(headItem ? [term("archive.headItem", "headItem", headItem)] : []),
      term("archive.rank", "rank", text(tool.class)),
      slotGrid(tool.supercharged, tool.natural_supercharged, text(tool.class)),
      ...baseStats([
        ["archive.baseDamage", tool.base_damage],
        ["archive.baseMining", tool.base_mining],
        ["archive.baseScanner", tool.base_scanner],
      ]),
    );
  }
  if (kind === "creature") {
    const creature = asRecord(record.creatures);
    fields.push(
      ...whereIs(chain, null, false),
      term("archive.combat", "rank", text(creature.combat)),
      term("archive.agility", "rank", text(creature.agility)),
      term("archive.health", "rank", text(creature.health)),
      term("archive.affinity", "affinity", text(creature.affinity)),
      term("archive.habitat", "habitatRow", text(creature.habitat)),
      term("archive.activeTime", "activeTimeRow", text(creature.active_time)),
      creatureRoute(chain, creature),
    );
  }
  return fields;
}

// The percents that close an item's card, one decimal each. A stat the body
// or hull has no range for is null, and stays off the card.
function baseStats(stats: [string, unknown][]): Field[] {
  return stats.flatMap(([label, value]) =>
    typeof value === "number"
      ? [{ type: "text", label, text: `${value.toFixed(1)}%` }]
      : [],
  );
}

// A ship's numbers are its wreck's, so a line above them says so.
function shipStats(ship: Record<string, unknown>): Field[] {
  const stats = baseStats([
    ["archive.baseDamage", ship.base_damage],
    ["archive.baseShield", ship.base_shield],
    ["archive.baseHyperdrive", ship.base_hyperdrive],
    ["archive.baseAgile", ship.base_agile],
  ]);
  return stats.length > 0
    ? [term("archive.baseStats", "baseStats", "asFound"), ...stats]
    : [];
}

// One step of the "how to get it" list: a message id and its values.
export type Step = { id: string; values: Record<string, string> };

type Point = {
  latitude: unknown;
  longitude: unknown;
  building_type: unknown;
};

type ChainStep = {
  id: string;
  kind: Kind;
  name: string;
  locator: string | null;
  pois: Point | null;
};

type ItemLink = {
  entryStation: boolean;
  entryLocator: string | null;
  point: Point | null;
};

function rows(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

function pointOf(value: unknown): Point | null {
  const point = asRecord(value);
  return "building_type" in point
    ? {
        latitude: point.latitude,
        longitude: point.longitude,
        building_type: point.building_type,
      }
    : null;
}

// The record and everything above it, from the embedded ancestors.
function chainOf(data: unknown): ChainStep[] {
  return rows(asRecord(data).asset_ancestors).flatMap((row) => {
    const step = asRecord(row.assets);
    const kind = kindSchema.safeParse(step.kind);
    if (!kind.success || typeof step.id !== "string") {
      return [];
    }
    return [
      {
        id: step.id,
        kind: kind.data,
        name: text(step.name) ?? "?",
        locator: text(step.locator),
        pois: pointOf(step.pois),
      },
    ];
  });
}

function linksOf(data: unknown): ItemLink[] {
  return rows(asRecord(data).poi_items).map((row) => ({
    entryStation: row.entry_station === true,
    entryLocator: text(asRecord(asRecord(row.bodies).assets).locator),
    point: pointOf(row.pois),
  }));
}

function above(chain: ChainStep[], kind: Kind): ChainStep | null {
  return chain.find((step) => step.kind === kind) ?? null;
}

// Where a planet is: galaxy, system, planet, and portal glyphs, and with a
// point the latitude and longitude of that point on the planet.
function whereIs(
  chain: ChainStep[],
  poi: Point | null,
  withGlyphs = true,
): Field[] {
  const planet = above(chain, "planet");
  const fields: Field[] = [
    {
      type: "text",
      label: "archive.galaxy",
      text: above(chain, "galaxy")?.name ?? null,
    },
    {
      type: "text",
      label: "archive.system",
      text: above(chain, "system")?.name ?? null,
    },
    { type: "text", label: "archive.planet", text: planet?.name ?? null },
  ];
  // An item shows its glyphs in the "how to get it" block instead.
  if (withGlyphs) {
    fields.push({
      type: "glyphs",
      label: "archive.portalGlyphs",
      glyphs: portalGlyphs(planet?.locator ?? null),
    });
  }
  if (poi) {
    fields.push(
      {
        type: "text",
        label: "archive.latitude",
        text: coordinate(poi.latitude),
      },
      {
        type: "text",
        label: "archive.longitude",
        text: coordinate(poi.longitude),
      },
    );
  }
  return fields;
}

// A creature has no point: a portal to its planet, then a search.
function creatureRoute(
  chain: ChainStep[],
  creature: Record<string, unknown>,
): Field {
  const locator = above(chain, "planet")?.locator ?? null;
  const steps: Step[] = [];
  if ((galaxyIndex(locator) ?? 0) !== 0) {
    steps.push({ id: "archive.step.galaxy", values: {} });
  }
  steps.push(
    { id: "archive.step.portal", values: {} },
    {
      id: "archive.step.find",
      values: {
        habitat: text(creature.habitat) ?? "ground",
        time: text(creature.active_time) ?? "any",
      },
    },
  );
  return {
    type: "steps",
    label: "archive.howTo",
    glyphs: portalGlyphs(locator),
    steps,
  };
}

function coordinate(value: unknown): string | null {
  return typeof value === "number" ? value.toFixed(2) : null;
}

// The last step at a point whose tool follows the save's load place, for a
// load on that planet or a portal arrival, and for a load on another planet.
const TAKE_HERE: Record<string, string> = {
  DroneHive: "archive.step.pillarHere",
  Shop: "archive.step.shopHere",
  Monolith: "archive.step.monolithHere",
};

const TAKE_FLY: Record<string, string> = {
  DroneHive: "archive.step.pillarFly",
  Shop: "archive.step.shopFly",
  Monolith: "archive.step.monolithFly",
};

// The last step at a point whose item needs no load place, where it is more
// than walking up and taking it.
const TAKE_PLAIN: Record<string, string> = {
  RobotHead: "archive.step.staff",
  Beacon: "archive.step.staff",
  CrashedFreighter: "archive.step.staff",
  Debris: "archive.step.staff",
  DropPod: "archive.step.staff",
};

// Points whose last step takes a tool from a cabinet or a crate: the player
// leaves a message there. A space station takes no building.
const CABINETS = new Set(["Shop", "AbandonedRobotCamp"]);

// Where an item is and how a player gets it. An item has its point above it;
// a point the chain does not name comes through poi_items. A tool of a shop,
// a monolith, or a pillar depends on the load place, so its steps do. The
// steps only refer to the fields, so every card reads alike.
function itemRoute(chain: ChainStep[], links: ItemLink[]): Field[] {
  const link = links[0] ?? null;
  const poi = above(chain, "building")?.pois ?? link?.point ?? null;
  if (!poi) {
    return [];
  }
  const planet = above(chain, "planet");
  const fields = whereIs(chain, poi, false);
  const building = text(poi.building_type) ?? "";
  if (building === "SpaceStation") {
    // Any portal of the system builds the station's list, so the first planet
    // serves, with no save.
    const locator = above(chain, "system")?.locator ?? "";
    const steps: Step[] = [
      { id: "archive.step.portal", values: {} },
      { id: "archive.step.stationHere", values: {} },
    ];
    if ((galaxyIndex(locator) ?? 0) !== 0) {
      steps.unshift({ id: "archive.step.galaxy", values: {} });
    }
    const first = `${locator.slice(0, 2)}1${locator.slice(3)}`;
    fields.push({
      type: "steps",
      label: "archive.howTo",
      glyphs: portalGlyphs(first),
      steps,
    });
    return fields;
  }
  // The one set of glyphs the player types: the planet the portal leads to.
  let portal = planet?.locator ?? null;
  const steps: Step[] = [];
  if ((galaxyIndex(planet?.locator ?? null) ?? 0) !== 0) {
    steps.push({ id: "archive.step.galaxy", values: {} });
  }
  const takeHere = TAKE_HERE[building];
  const takeFly = TAKE_FLY[building];
  if (!takeHere || !takeFly) {
    steps.push(
      { id: "archive.step.portal", values: {} },
      { id: TAKE_PLAIN[building] ?? "archive.step.take", values: {} },
    );
  } else if (link?.entryStation) {
    // A portal arrival builds the weapon list of the system, the same list
    // as a load on the station, so no save is needed.
    steps.push(
      { id: "archive.step.portal", values: {} },
      { id: takeHere, values: {} },
    );
  } else if (link?.entryLocator && link.entryLocator !== planet?.locator) {
    // A tool of a planet's list needs a load there: save and load after the
    // portal, then fly to the point.
    portal = link.entryLocator;
    steps.push(
      { id: "archive.step.portal", values: {} },
      { id: "archive.step.saveLoad", values: {} },
      { id: takeFly, values: {} },
    );
  } else {
    steps.push(
      { id: "archive.step.portal", values: {} },
      { id: "archive.step.saveLoad", values: {} },
      { id: takeHere, values: {} },
    );
  }
  if (CABINETS.has(building)) {
    steps.push({ id: "archive.step.leaveMessage", values: {} });
  }
  fields.push({
    type: "steps",
    label: "archive.howTo",
    glyphs: portalGlyphs(portal),
    steps,
  });
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

// A list of loc-key values shown by their translations.
function terms(label: string, group: string, value: unknown): Field {
  return {
    type: "terms",
    label,
    group,
    values: Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [],
  };
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
