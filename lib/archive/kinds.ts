export const KINDS = [
  "galaxy",
  "system",
  "planet",
  "building",
  "ship",
  "tool",
  "creature",
] as const;

export type Kind = (typeof KINDS)[number];

// The words a search uses, for page titles. Every ship on the site is a
// wreck, and every building a space station.
export const KIND_TITLES: Record<Kind, { one: string; many: string }> = {
  galaxy: { one: "Galaxy", many: "Galaxies" },
  system: { one: "Star system", many: "Star systems" },
  planet: { one: "Planet", many: "Planets" },
  building: { one: "Space station", many: "Space stations" },
  ship: { one: "Crashed ship", many: "Crashed ships" },
  tool: { one: "Multitool", many: "Multitools" },
  creature: { one: "Creature", many: "Creatures" },
};

// The title and description of each catalog list, in the words players search.
export const CATALOG_PAGES: Record<
  Kind,
  { title: string; description: string }
> = {
  galaxy: {
    title: "No Man's Sky galaxies: types and listed systems",
    description:
      "Galaxies of No Man's Sky with their type, Normal, Lush, Harsh, or Empty, and the star systems listed in each.",
  },
  system: {
    title: "Star systems with multitools and crashed ships in No Man's Sky",
    description:
      "Star systems of No Man's Sky with their star, economy, and space station, and the planets that hold the listed multitools and crashed ships.",
  },
  planet: {
    title: "Planets with multitools and crashed ships in No Man's Sky",
    description:
      "Planets of the listed star systems in No Man's Sky, with biome, Sentinels, and resources, and the multitools, crashed ships, and creatures on each.",
  },
  building: {
    title: "Space stations in No Man's Sky",
    description:
      "Space stations of No Man's Sky and any listed multitool their weapon cabinets sell.",
  },
  ship: {
    title: "Crashed ships with adjacent supercharged slots in No Man's Sky",
    description:
      "Crashed ships and Sentinel Interceptors of No Man's Sky whose four supercharged slots sit side by side, with the portal glyphs and coordinates of each wreck.",
  },
  tool: {
    title: "Multitools with adjacent supercharged slots in No Man's Sky",
    description:
      "Multitools and staffs of No Man's Sky whose four supercharged slots at class S sit side by side, with the portal glyphs and coordinates to pick each one up.",
  },
  creature: {
    title: "Creatures to adopt in No Man's Sky",
    description:
      "Creatures of No Man's Sky you can adopt as a companion, with their grades, planet, portal glyphs, and coordinates.",
  },
};

export const FEED_KINDS = ["planet", "ship", "tool", "creature"] as const;

export const PAGE_SIZE = 25;

export const LIKABLE = new Set<Kind>(["planet", "ship", "tool", "creature"]);

export const STAR_OPTIONS = [
  "yellow",
  "green",
  "blue",
  "red",
  "purple",
] as const;

export const STATION_OPTIONS = [
  "inhabited",
  "abandoned",
  "pirate",
  "uncharted",
] as const;

// Biome types; Test (11) is not a biome of the game.
export const BIOME_OPTIONS = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "12",
  "13",
  "14",
  "15",
] as const;

export const SENTINEL_OPTIONS = ["low", "high", "aggressive"] as const;

// Hulls a wreck can have: the civilian weights give the first five, a few
// become solar, and a sentinel wreck is an interceptor. Freighters, living
// ships, corvettes, and swarm drones are never wrecks on a planet.
export const HULL_OPTIONS = [
  "hauler",
  "fighter",
  "explorer",
  "shuttle",
  "exotic",
  "solar",
  "interceptor",
] as const;

export const RANK_OPTIONS = ["C", "B", "A", "S"] as const;

// Bodies a stored tool can have: the standard pool gives the first four and
// the exotic pool gives royal, a harmonic camp pays sentinel, and a monolith
// pays one of the three Atlas models, and a robot head builds a staff.
export const TOOL_BODY_OPTIONS = [
  "pistol",
  "rifle",
  "experimental",
  "alien",
  "royal",
  "sentinel",
  "atlantid",
  "staff",
] as const;

// Kinds with lists of their own. A building only holds the coordinates of its
// items and has none.
export const PAGE_KINDS = KINDS.filter((kind) => kind !== "building");

const KIND_SET = new Set<string>(PAGE_KINDS);

// The `name` of a space station's point; a planet's points have their class.
export const STATION_BUILDING = "SpaceStation";

export function isKind(value: string): value is Kind {
  return KIND_SET.has(value);
}

// A record page takes a building too, for a space station: `readRecord` turns
// down any other.
export function isRecordKind(value: string): value is Kind {
  return isKind(value) || value === "building";
}

export function childKinds(kind: Kind): Kind[] {
  switch (kind) {
    case "galaxy":
      return ["system"];
    case "system":
      return ["planet"];
    default:
      return [];
  }
}
