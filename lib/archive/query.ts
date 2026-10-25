import {
  BIOME_OPTIONS,
  BUILDING_OPTIONS,
  HULL_OPTIONS,
  PAGE_SIZE,
  RANK_OPTIONS,
  SENTINEL_OPTIONS,
  STAR_OPTIONS,
  STATION_OPTIONS,
  TOOL_BODY_OPTIONS,
  type Kind,
} from "@/lib/archive/kinds";

export type CatalogQuery = {
  kinds: Kind[];
  parentId: string | null;
  page: number;
  name: string;
  star: string;
  station: string;
  biome: string;
  sentinels: string;
  hull: string;
  rank: string;
  toolBody: string;
  building: string;
  dissonance: boolean;
  gasGiant: boolean;
  counted: boolean;
};

export type FilterField =
  | {
      type: "select";
      param: SelectParam;
      group: string;
      options: readonly string[];
    }
  | { type: "check"; param: "dissonance" | "gasGiant" };

type SelectParam =
  | "star"
  | "station"
  | "biome"
  | "sentinels"
  | "hull"
  | "rank"
  | "toolBody"
  | "building";

type RawSearch = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ?? "";
}

function oneOf(value: string, options: readonly string[]): string {
  return options.includes(value) ? value : "";
}

export function parseCatalogQuery(
  kinds: Kind[],
  raw: RawSearch,
  parentId?: string,
): CatalogQuery {
  const page = Number(first(raw.page));
  const onlyBuildings = kinds.length === 1 && kinds[0] === "building";
  return {
    kinds,
    parentId: parentId ?? null,
    page: Number.isInteger(page) && page > 0 ? page : 1,
    name: first(raw.name).slice(0, 80),
    star: oneOf(first(raw.star), STAR_OPTIONS),
    station: oneOf(first(raw.station), STATION_OPTIONS),
    biome: oneOf(first(raw.biome), BIOME_OPTIONS),
    sentinels: oneOf(first(raw.sentinels), SENTINEL_OPTIONS),
    hull: oneOf(first(raw.hull), HULL_OPTIONS),
    rank: oneOf(first(raw.rank), RANK_OPTIONS),
    toolBody: oneOf(first(raw.toolBody), TOOL_BODY_OPTIONS),
    building: oneOf(first(raw.building), BUILDING_OPTIONS),
    dissonance: first(raw.dissonance) === "1",
    gasGiant: first(raw.gasGiant) === "1",
    counted: !onlyBuildings,
  };
}

export function filtersFor(kinds: Kind[]): FilterField[] {
  if (kinds.length !== 1) {
    return [];
  }
  switch (kinds[0]) {
    case "system":
      return [
        { type: "select", param: "star", group: "star", options: STAR_OPTIONS },
        {
          type: "select",
          param: "station",
          group: "station",
          options: STATION_OPTIONS,
        },
        { type: "check", param: "dissonance" },
        { type: "check", param: "gasGiant" },
      ];
    case "planet":
      return [
        {
          type: "select",
          param: "biome",
          group: "biome",
          options: BIOME_OPTIONS,
        },
        {
          type: "select",
          param: "sentinels",
          group: "sentinel",
          options: SENTINEL_OPTIONS,
        },
        { type: "check", param: "dissonance" },
      ];
    case "building":
      return [
        {
          type: "select",
          param: "building",
          group: "building",
          options: BUILDING_OPTIONS,
        },
      ];
    case "ship":
      return [
        { type: "select", param: "hull", group: "hull", options: HULL_OPTIONS },
        { type: "select", param: "rank", group: "rank", options: RANK_OPTIONS },
      ];
    case "tool":
      return [
        {
          type: "select",
          param: "toolBody",
          group: "toolBody",
          options: TOOL_BODY_OPTIONS,
        },
        { type: "select", param: "rank", group: "rank", options: RANK_OPTIONS },
      ];
    default:
      return [];
  }
}

export function catalogKey(query: CatalogQuery): readonly unknown[] {
  return ["catalog", query];
}

export function toSearchParams(query: CatalogQuery, page = query.page): string {
  const active = new Set(filtersFor(query.kinds).map((field) => field.param));
  const params = new URLSearchParams();
  if (query.name) {
    params.set("name", query.name);
  }
  if (query.star && active.has("star")) {
    params.set("star", query.star);
  }
  if (query.station && active.has("station")) {
    params.set("station", query.station);
  }
  if (query.biome && active.has("biome")) {
    params.set("biome", query.biome);
  }
  if (query.sentinels && active.has("sentinels")) {
    params.set("sentinels", query.sentinels);
  }
  if (query.hull && active.has("hull")) {
    params.set("hull", query.hull);
  }
  if (query.rank && active.has("rank")) {
    params.set("rank", query.rank);
  }
  if (query.toolBody && active.has("toolBody")) {
    params.set("toolBody", query.toolBody);
  }
  if (query.building && active.has("building")) {
    params.set("building", query.building);
  }
  if (query.dissonance && active.has("dissonance")) {
    params.set("dissonance", "1");
  }
  if (query.gasGiant && active.has("gasGiant")) {
    params.set("gasGiant", "1");
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  const text = params.toString();
  return text ? `?${text}` : "";
}

export function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}
