import stats from "@/lib/archive/about-stats.json";

export { stats };

const WORDS: [number, string][] = [
  [1e12, "trillion"],
  [1e9, "billion"],
  [1e6, "million"],
];

// Two significant digits, or words for the very large.
export function amount(value: number) {
  for (const [size, word] of WORDS) {
    if (value >= size) {
      return `${Number((value / size).toPrecision(2))} ${word}`;
    }
  }
  if (value >= 10) {
    return Number(value.toPrecision(2)).toLocaleString("en-US");
  }
  return String(Number(value.toPrecision(2)));
}

export function share(value: number) {
  const percent = value * 100;
  if (percent >= 10) {
    return `${Math.round(percent)}%`;
  }
  return `${Number(percent.toPrecision(2))}%`;
}

// A share as "one in N", N with two significant digits at most.
function oneIn(value: number) {
  return amount(1 / value);
}

export const euclid = stats.euclid;

export function stepOf(steps: typeof euclid.tools, key: string) {
  return steps.find((step) => step.key === key)?.per_system ?? 0;
}

export const STARS_PER_REGION = stats.galaxy.stars_per_region;

function bucket(histogram: Record<string, number>, keys: string[]) {
  return keys.reduce((sum, key) => sum + (histogram[key] ?? 0), 0);
}

function numbers(): Record<string, string> {
  const offers = stepOf(euclid.tools, "offers");
  const kept = stepOf(euclid.tools, "kept");
  const ships = stepOf(euclid.ships, "kept");
  const pillars = euclid.pillar_survey;
  const secondsPerYear = 365.25 * 24 * 3600;
  const star = stats.star_of_the_show;
  return {
    regions: String(stats.sample.regions),
    otherRegions: String(stats.sample.regions_per_other_galaxy),
    regionsCounted: amount(stats.sample.regions_counted),
    starsPerRegion: String(stats.sample.stars_per_region),
    galaxyAcross: amount(stats.galaxy.light_years_across),
    galaxyThick: amount(stats.galaxy.light_years_thick),
    regionsInGalaxy: amount(stats.galaxy.regions),
    yearsToLook: amount(stats.galaxy.systems / secondsPerYear),
    yellowShare: share(euclid.star_colours.yellow),
    offersPerSystem: amount(offers),
    touchingShare: share(euclid.tool_touching_share),
    touchingOneIn: String(Math.round((1 - euclid.tool_touching_share) * 100)),
    toolCap: "six",
    toolsPerSystem: amount(kept),
    shipsPerSystem: amount(ships),
    toolRatio: amount(offers / kept),
    royalOneIn: String(Math.round(1 / pillars.royal_share)),
    planetTools: share(euclid.planet_shares.tool),
    planetShips: share(euclid.planet_shares.ship),
    toolPlacements: String(stats.grids.tool),
    shipPlacements: String(stats.grids.ship),
    squareShare: share(euclid.tool_figures.O),
    squareOneIn: oneIn(pillars.square_share),
    wholeStars: String(stats.whole_region.stars),
    pistolPlacements: String(stats.whole_region.pistol_placements),
    wholeTools: String(stats.whole_region.kept_tools),
    wholeShips: String(stats.whole_region.kept_ships),
    wrecksPerShip: amount(stepOf(euclid.ships, "connected") / ships),
    interceptorAll: share(euclid.ship_hulls.interceptor),
    interceptorKept: share(euclid.kept_ship_hulls.interceptor),
    toolSystems: share(1 - euclid.system_shares.tool),
    noShipSystems: share(1 - euclid.system_shares.ship),
    shipsPerFinding: amount(euclid.per_finding_system.ships),
    toolsPerFinding: amount(euclid.per_finding_system.tools),
    fullOneIn: `one in ${oneIn(euclid.system_shares.full)}`,
    showcaseTotal: String(
      stats.showcase.reduce((sum, row) => sum + row.systems, 0),
    ),
    showcaseList: stats.showcase
      .map((row) => `${row.name.replace(" Galaxy", "")} ${row.systems}`)
      .join(", "),
    showcaseGalaxies: String(stats.showcase.length),
    starTool: star.tool,
    starSystem: star.system,
    starGalaxy: star.galaxy,
  };
}

// Writes the numbers into the rendered text; a name it does not know stays
// visible, so a typo in about.md shows on the page.
export function fillNumbers(html: string) {
  const values = numbers();
  return html.replace(/\{\{(\w+)\}\}/g, (found, name: string) =>
    name in values ? values[name] : found,
  );
}

export function histogramRows() {
  const tools = euclid.tool_histogram as Record<string, number>;
  const ships = euclid.ship_histogram as Record<string, number>;
  const many = ["6", "7", "8", "9", "10", "11", "12"];
  return [
    ...["0", "1", "2", "3", "4", "5"].map((key) => ({
      label: key,
      tools: tools[key] ?? 0,
      ships: ships[key] ?? 0,
    })),
    {
      label: "6 or more",
      tools: bucket(tools, many),
      ships: bucket(ships, many),
    },
  ];
}
