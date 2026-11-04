import {
  STATION_BUILDING,
  KINDS,
  RANK_OPTIONS,
  type Kind,
} from "@/lib/archive/kinds";
import { kindSchema, listRowSchema, slotSchema } from "@/lib/archive/schema";
import {
  type ArchiveClient,
  type Field,
  type SlotCell,
  type AssetCard,
  galaxyImage,
  type AssetHead,
  fail,
  likedSet,
  stationName,
  term,
  terms,
  flag,
  asRecord,
  text,
  bool,
  numberText,
} from "@/lib/archive/read/common";
import {
  type ChainStep,
  chainOf,
  linksOf,
  above,
  creatureRoute,
  itemRoute,
  whereIs,
} from "@/lib/archive/read/route";
import { shipStats, toolStats } from "@/lib/archive/read/stats";

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
  const start = Math.max(
    RANK_OPTIONS.findIndex((rank) => rank === found),
    0,
  );
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
        rank: RANK_OPTIONS[Math.min(extra < 0 ? start : start + 1 + extra, 3)],
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
    fail(error);
  }
  if (!data) {
    return null;
  }
  const parsedHead = assetHead.safeParse(data);
  if (!parsedHead.success) {
    fail(parsedHead.error);
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
    fail(error);
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
      ...toolStats(tool),
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
    fail(error);
  }
  return count ?? 0;
}
