import { galaxyIndex, portalGlyphs } from "@/lib/archive/address";
import type { Kind } from "@/lib/archive/kinds";
import { kindSchema } from "@/lib/archive/schema";
import { type Field, rows, asRecord, text } from "@/lib/archive/read/common";

// One step of the "how to get it" list: a message id and its values.
export type Step = { id: string; values: Record<string, string> };

type Point = {
  latitude: unknown;
  longitude: unknown;
  building_type: unknown;
};

export type ChainStep = {
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
export function chainOf(data: unknown): ChainStep[] {
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

export function linksOf(data: unknown): ItemLink[] {
  return rows(asRecord(data).poi_items).map((row) => ({
    entryStation: row.entry_station === true,
    entryLocator: text(asRecord(asRecord(row.bodies).assets).locator),
    point: pointOf(row.pois),
  }));
}

export function above(chain: ChainStep[], kind: Kind): ChainStep | null {
  return chain.find((step) => step.kind === kind) ?? null;
}

// Where a planet is: galaxy, system, planet, and portal glyphs, and with a
// point the latitude and longitude of that point on the planet.
export function whereIs(
  chain: ChainStep[],
  poi: Point | null,
  withGlyphs = true,
): Field[] {
  const planet = above(chain, "planet");
  // Each place is a link to its own page, as in the breadcrumbs.
  const place = (label: string, step: ChainStep | undefined | null): Field => ({
    type: "text",
    label,
    text: step?.name ?? null,
    ...(step ? { href: `/${step.kind}/${step.id}` } : {}),
  });
  const fields: Field[] = [
    place("archive.galaxy", above(chain, "galaxy")),
    place("archive.system", above(chain, "system")),
    place("archive.planet", planet),
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
export function creatureRoute(
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
export function itemRoute(chain: ChainStep[], links: ItemLink[]): Field[] {
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
