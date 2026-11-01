import {
  BIOME_OPTIONS,
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
  // Any depth below this record: a planet's items hang under its points.
  ancestorId: string | null;
  // The items this player liked.
  likedBy: string | null;
  // The open tab of a planet's items: tool, creature, or ship.
  tab: string;
  page: number;
  name: string;
  star: string;
  station: string;
  biome: string;
  sentinels: string;
  hull: string;
  rank: string;
  toolBody: string;
  dissonance: boolean;
  gasGiant: boolean;
  counted: boolean;
};

// Whether the visitor narrowed the list with a filter this kind has.
export function isFiltered(query: CatalogQuery): boolean {
  return (
    query.name !== "" ||
    filtersFor(query.kinds).some((field) => query[field.param])
  );
}

export type FilterField =
  | {
      type: "select";
      param: SelectParam;
      group: string;
      options: readonly string[];
    }
  | { type: "check"; param: "dissonance" | "gasGiant" };

type SelectParam =
  "star" | "station" | "biome" | "sentinels" | "hull" | "rank" | "toolBody";

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
  return {
    kinds,
    parentId: parentId ?? null,
    ancestorId: null,
    likedBy: null,
    tab: oneOf(first(raw.tab), ["tool", "creature", "ship"] as const),
    page: Number.isInteger(page) && page > 0 ? page : 1,
    name: first(raw.name).slice(0, 80),
    star: oneOf(first(raw.star), STAR_OPTIONS),
    station: oneOf(first(raw.station), STATION_OPTIONS),
    biome: oneOf(first(raw.biome), BIOME_OPTIONS),
    sentinels: oneOf(first(raw.sentinels), SENTINEL_OPTIONS),
    hull: oneOf(first(raw.hull), HULL_OPTIONS),
    rank: oneOf(first(raw.rank), RANK_OPTIONS),
    toolBody: oneOf(first(raw.toolBody), TOOL_BODY_OPTIONS),
    dissonance: first(raw.dissonance) === "1",
    gasGiant: first(raw.gasGiant) === "1",
    counted: true,
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
  const params = new URLSearchParams();
  if (query.tab) {
    params.set("tab", query.tab);
  }
  if (query.name) {
    params.set("name", query.name);
  }
  for (const field of filtersFor(query.kinds)) {
    const value = query[field.param];
    if (value) {
      params.set(field.param, value === true ? "1" : value);
    }
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
