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

export const FEED_KINDS = ["planet", "ship", "tool", "creature"] as const;

export type FeedKind = (typeof FEED_KINDS)[number];

export const PAGE_SIZE = 25;

export const HOME_LIMIT = 12;

export const LIKABLE = new Set<Kind>([
  "planet",
  "building",
  "ship",
  "tool",
  "creature",
]);

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
  "11",
  "12",
  "13",
  "14",
  "15",
] as const;

export const SENTINEL_OPTIONS = ["low", "high", "aggressive"] as const;

export const HULL_OPTIONS = [
  "Freighter",
  "Dropship",
  "Fighter",
  "Scientific",
  "Shuttle",
  "Royal",
  "Alien",
  "Sail",
  "Robot",
  "Corvette",
  "SwarmDrone",
] as const;

export const RANK_OPTIONS = ["C", "B", "A", "S"] as const;

export const TOOL_BODY_OPTIONS = [
  "Pistol",
  "Rifle",
  "Pristine",
  "Alien",
  "Royal",
  "Robot",
  "Atlas",
  "Staff",
] as const;

export const BUILDING_OPTIONS = [
  "TerrainResource",
  "Shelter",
  "Abandoned",
  "Terminal",
  "Shop",
  "Outpost",
  "Waypoint",
  "Beacon",
  "RadioTower",
  "Observatory",
  "Depot",
  "Factory",
  "Harvester",
  "Plaque",
  "Monolith",
  "Portal",
  "Ruin",
  "Debris",
  "DropPod",
  "DistressSignal",
  "LandingPad",
  "Base",
  "MissionTower",
  "CrashedFreighter",
  "GraveInCave",
  "StoryGlitch",
  "TreasureRuins",
  "GameStartSpawn",
  "WaterCrashedFreighter",
  "WaterTreasureRuins",
  "WaterAbandoned",
  "WaterDistressSignal",
  "NPCDistressSignal",
  "NPCDebris",
  "LargeBuilding",
  "Settlement_Hub",
  "Settlement_LandingZone",
  "Settlement_Bar",
  "Settlement_Tower",
  "Settlement_Market",
  "Settlement_Small",
  "Settlement_SmallIndustrial",
  "Settlement_Medium",
  "Settlement_Large",
  "Settlement_Monument",
  "Settlement_SheriffsOffice",
  "Settlement_Double",
  "Settlement_Farm",
  "Settlement_Factory",
  "Settlement_Clump",
  "DroneHive",
  "SentinelDistressSignal",
  "AbandonedRobotCamp",
  "RobotHead",
  "DigSite",
  "AncientGuardian",
  "Settlement_Hub_Builders",
  "Settlement_FishPond",
  "Settlement_Builders_RoboArm",
  "CargoDrop",
  "ScrapYard",
  "Crashed_Swarm",
] as const;

const KIND_SET = new Set<string>(KINDS);

export function isKind(value: string): value is Kind {
  return KIND_SET.has(value);
}

export function childKinds(kind: Kind): Kind[] {
  switch (kind) {
    case "galaxy":
      return ["system"];
    case "system":
      return ["planet"];
    case "planet":
      return ["building", "creature"];
    case "building":
      return ["ship", "tool"];
    default:
      return [];
  }
}
