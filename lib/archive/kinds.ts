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

// The words a search uses, for page titles.
export const KIND_TITLES: Record<Kind, { one: string; many: string }> = {
  galaxy: { one: "Galaxy", many: "Galaxies" },
  system: { one: "Star system", many: "Star systems" },
  planet: { one: "Planet", many: "Planets" },
  building: { one: "Building", many: "Buildings" },
  ship: { one: "Starship", many: "Starships" },
  tool: { one: "Multi-tool", many: "Multi-tools" },
  creature: { one: "Creature", many: "Creatures" },
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
