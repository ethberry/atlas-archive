import "server-only";

import {
  chartSpec,
  type ChartSeries,
  type ChartSpec,
} from "@/lib/archive/chart-spec";
import { rawTableOf, tablesOf, type StatTable } from "@/lib/archive/statistics";
import type {
  Cell,
  ColumnKind,
  RawTable,
} from "@/lib/archive/statistics-format";

// How a table is charted. Left out, a table of numbers gets its share columns, or
// else its number columns, stacked when they add up to a whole, as bars otherwise.
type Rule = {
  kind?: ChartSpec["kind"];
  // The heads to draw.
  columns?: string[];
  title?: string;
  axis?: string;
  // Rows left off the chart, when one would flatten the rest. The table keeps them.
  without?: string[];
  // Shares on the whole scale, 0 to 100%.
  whole?: boolean;
};

const NONE = "none";
const RANGE = "range";
const ROLL = "roll";

const STAT = { columns: ["Lowest", "Median", "Highest"] };
const SPOTS = { kind: "stack" as const };
const ROCKY = { ...SPOTS, without: ["Gas Giant"] };
const CLASS_STACK = {
  kind: "stack" as const,
  columns: ["Class C", "Class B", "Class A", "Class S"],
};

type Plan = Rule | typeof NONE | typeof RANGE | typeof ROLL;

const RULES: Record<string, Record<string, Plan>> = {
  "where-to-look": {
    stars: {
      kind: "line",
      columns: ["Yellow stars", "Purple stars", "Uncharted"],
    },
  },
  systems: {
    bodies: { kind: "line" },
    colours: { columns: ["Share"] },
    moons: { kind: "line" },
  },
  economy: {
    conflict: { columns: ["Class S tools", "Adjacent tools"] },
    economy: { columns: ["Class S tools", "Adjacent tools"] },
    stations: { kind: "line" },
    wealth: { columns: ["Class S tools", "Adjacent tools"] },
  },
  "space-stations": { kinds: NONE, merchants: NONE },
  "supercharged-slots": {
    ceiling: NONE,
    figures: NONE,
    helpers: NONE,
    layouts: { columns: ["Times the Boltcaster alone"] },
    rules: NONE,
    shipCards: NONE,
  },
  "technology-merchants": {
    count: { kind: "line" },
    sets: NONE,
  },
  freighters: {
    classes: { kind: "stack", columns: ["C", "B", "A", "S"] },
    tries: NONE,
  },
  dreadnoughts: {
    arrival: { columns: ["Dreadnought on arrival"], whole: true },
  },
  races: {
    finds: { columns: ["Class S tools", "Adjacent tools"] },
    spots: SPOTS,
  },
  "sources-by-size": {
    peaks: { columns: ["Planets with none"] },
    present: NONE,
    staffs: SPOTS,
    tools: SPOTS,
    wrecks: SPOTS,
  },
  "sources-by-type": {
    present: NONE,
    staffs: ROCKY,
    tools: ROCKY,
    wrecks: ROCKY,
  },
  "empty-worlds": { matrix: NONE, sea: { kind: "line" } },
  "sentinels-and-dissonance": {
    biomes: { columns: ["Dissonant", "Aggressive"] },
    galaxies: { columns: ["Dissonant", "Aggressive"] },
    sizes: { columns: ["Dissonant", "Aggressive"] },
  },
  "multitool-types": {
    sources: { columns: ["Share"] },
    types: CLASS_STACK,
  },
  "multitool-classes": {
    peaks: { columns: ["Median S tools"] },
    wealth: { title: "Multitool classes by wealth" },
  },
  "multitool-stats": {
    damage: STAT,
    mining: STAT,
    ranges: NONE,
    scanner: STAT,
  },
  "multitool-upgrades": { raised: NONE },
  figures: { turns: NONE },
  staffs: { heads: NONE, terminals: { columns: ["Share"] } },
  "ship-types": {
    hulls: { columns: ["Share"] },
    sources: { columns: ["Share"] },
  },
  "ship-classes": { classBands: ROLL, hullBands: ROLL },
  "ship-stats": {
    agile: STAT,
    damage: STAT,
    hyperdrive: STAT,
    ranges: NONE,
    shield: STAT,
  },
  "ship-upgrades": {
    slots: { columns: ["Adjacent at S", "Interceptor, adjacent at S"] },
  },
  "ship-figures": { turns: NONE },
  // Two groups of two, both out of all wrecks: a figure that is no square, and
  // a square. "Square, of adjacent" counts out of adjacent wrecks, so it stays
  // in the table: beside them it would read as more squares.
  interceptors: {
    compare: { columns: ["Figure, no square", "Square"] },
    wealth: { columns: ["Of Interceptors"] },
  },
  "creature-roles": {
    biomes: {
      kind: "stack",
      columns: ["In the air", "Under water", "Underground", "On the ground"],
    },
    habitats: { columns: ["Of all creatures"] },
    lists: { kind: "line" },
  },
  "creature-grades": {
    biomes: { columns: ["Holds one or more"] },
    galaxies: { columns: ["Holds one or more"] },
    lists: { kind: "line" },
    odds: { kind: "line" },
    sizes: { columns: ["Holds one or more"] },
  },
  "creature-stats": {
    bands: RANGE,
    growth: { columns: ["Combat Effectiveness", "Agility", "Health"] },
    reach: RANGE,
    tops: RANGE,
    trait: { columns: ["Chance"] },
  },
  "creature-affinity": { chart: NONE },
  fishing: {
    baits: NONE,
    common: NONE,
    fishBait: NONE,
    flotsam: NONE,
    legendary: NONE,
    rare: NONE,
    sizes: { columns: ["Shallow water", "Deep water"] },
    special: NONE,
    uncommon: NONE,
    values: NONE,
    waterworld: { columns: ["Shallow water", "Deep water"] },
  },
  "excavation-finds": {
    displays: NONE,
    elsewhere: NONE,
    limbs: NONE,
    skulls: NONE,
    tails: NONE,
    torsos: NONE,
  },
  "battle-moves": {
    edits: NONE,
    kits: NONE,
    medals: NONE,
    moves1: NONE,
    moves2: NONE,
    moves3: NONE,
    moves4: NONE,
    moves5: NONE,
    names: NONE,
    pellets: { columns: ["Retroviral Pellet"] },
  },
};

// These pages keep their tables in the item values, printed.
const ITEM_PAGES = {
  "multitool-stats": 1,
  "ship-stats": 1,
  "multitool-upgrades": 1,
};

const SHARES: ColumnKind[] = ["share", "smallShare"];
const NUMBERS: ColumnKind[] = ["median", "count", "tenths", "plain"];

// The number in a cell: a bare number, or a marked one.
function numberOf(cell: Cell) {
  if (typeof cell === "number") {
    return cell;
  }
  return cell !== null && typeof cell === "object" && "k" in cell
    ? cell.v
    : null;
}

// A number a table printed, for a table with no raw values.
function parsed(cell: string) {
  const value = Number.parseFloat(cell);
  return Number.isFinite(value) ? value : null;
}

function columnsOf(rule: Rule, head: string[], kinds?: ColumnKind[]) {
  if (rule.columns) {
    return rule.columns.map((name) => head.indexOf(name));
  }
  const at = (wanted: ColumnKind[]) =>
    head.flatMap((_, index) =>
      index > 0 && kinds && wanted.includes(kinds[index]) ? [index] : [],
    );
  return at(SHARES).length ? at(SHARES) : at(NUMBERS);
}

function formatOf(kinds: ColumnKind[] | undefined, at: number[]) {
  const kind = kinds?.[at[0]];
  if (kind === "tenths" || !kinds) {
    return "number";
  }
  return SHARES.includes(kind as ColumnKind) ? "share" : "count";
}

function adds(series: Pick<ChartSeries, "values">[], rows: number) {
  return (
    series.length > 1 &&
    Array.from({ length: rows }).every((_, row) => {
      const sum = series.reduce((all, one) => all + (one.values[row] ?? 0), 0);
      return sum === 0 || Math.abs(sum - 1) < 0.03;
    })
  );
}

function specOf(
  printed: StatTable,
  raw: RawTable | undefined,
  rule: Rule,
): ChartSpec | null {
  const at = columnsOf(rule, printed.head, raw?.kinds);
  if (!at.length) {
    return null;
  }
  const kept = printed.rows.flatMap((row, index) =>
    rule.without?.includes(row[0]) ? [] : [index],
  );
  const series = at.map((index) => ({
    label: printed.head[index],
    values: kept.map((row) =>
      raw ? numberOf(raw.rows[row][index]) : parsed(printed.rows[row][index]),
    ),
    exact: kept.map((row) => printed.rows[row][index]),
  }));
  const format = formatOf(raw?.kinds, at);
  return chartSpec({
    kind:
      rule.kind ??
      (format === "share" && adds(series, kept.length) ? "stack" : "bars"),
    labels: kept.map((row) => printed.rows[row][0]),
    series,
    format,
    label: printed.note,
    title: rule.title,
    axis: rule.axis,
    whole: rule.whole,
  });
}

// Where a cell runs: `100 to 120` from its numbers, `+41` or a lone value from 0
// or as a point.
function spanOf(text: string): [number, number] | null {
  const numbers = (text.match(/\d+(\.\d+)?/g) ?? []).map(Number);
  if (!numbers.length || text === "0") {
    return null;
  }
  if (text.startsWith("+")) {
    return [0, numbers[0]];
  }
  return [numbers[0], numbers[numbers.length - 1]];
}

// Where a raw cell runs: the two numbers of a `{0} to {1}` cell as the file
// holds them, or else what its printed text reads.
function rawSpanOf(cell: Cell | undefined, text: string) {
  if (cell !== null && typeof cell === "object" && "t" in cell) {
    const [low, high] = cell.v;
    if (cell.v.length === 2) {
      return [low.v, high.v] as [number, number];
    }
  }
  return spanOf(text);
}

// A range chart: one panel per column, each on its own scale.
function rangeSpec(printed: StatTable, raw: RawTable | undefined): ChartSpec {
  return chartSpec({
    kind: "range",
    labels: printed.rows.map((row) => row[0]),
    series: printed.head.slice(1).map((label, index) => ({
      label,
      values: [],
      spans: printed.rows.map((row, at) =>
        rawSpanOf(raw?.rows[at]?.[index + 1], row[index + 1]),
      ),
      exact: printed.rows.map((row) => row[index + 1]),
    })),
    format: "number",
    label: printed.note,
  });
}

// The parts of a roll, from 0 to 1, stacked in order. A part in two pieces, as
// `0 to 0.05, and 0.20 to 1`, adds an unnamed last series for the second.
function rollSpec(printed: StatTable): ChartSpec {
  const pieces = (cell: string) =>
    cell.split(", and ").map((one) => spanOf(one) ?? ([0, 0] as const));
  const columns = printed.head.slice(1);
  const wide = (at: number, piece: number) =>
    printed.rows.map((row) => {
      const part = pieces(row[at + 1])[piece];
      return part ? part[1] - part[0] : 0;
    });
  const series = columns.map((label, at) => ({
    label,
    values: wide(at, 0),
    exact: printed.rows.map((row) => row[at + 1]),
  }));
  const second = columns.flatMap((label, at) =>
    printed.rows.some((row) => row[at + 1].includes(", and "))
      ? [
          {
            label,
            values: wide(at, 1),
            exact: printed.rows.map((row) => row[at + 1]),
          },
        ]
      : [],
  );
  return chartSpec({
    kind: "stack",
    labels: printed.rows.map((row) => row[0]),
    series: [...series, ...second],
    format: "roll",
    label: printed.note,
    axis: "The roll",
  });
}

// "100,000 to 200,000 ly" reads "200k", and "Over 700,000 ly" reads "700k+".
function ringLabel(text: string) {
  const numbers = text.match(/[\d,]+/g) ?? [];
  const end = Number((numbers[numbers.length - 1] ?? "0").replaceAll(",", ""));
  return `${end / 1000}k${text.startsWith("Over") ? "+" : ""}`;
}

// Every column as an index: the core ring is 100, so lines of any size share one
// scale. The tooltip keeps the printed number.
function rings(slug: string, printed: StatTable): ChartSpec {
  const table = rawTableOf(slug, "rings");
  return chartSpec({
    kind: "line",
    title: "Compared with the core, 100",
    label: printed.note,
    axis: "Light years from the core, outer edge of the ring",
    labels: printed.rows.map((row) => ringLabel(row[0])),
    series: table.head.slice(1).map((label, index) => {
      const values = table.rows.map((row) => numberOf(row[index + 1]));
      const first = values[0] ?? 1;
      return {
        label,
        values: values.map((value) =>
          value === null ? null : (value / first) * 100,
        ),
        exact: printed.rows.map((row) => row[index + 1]),
      };
    }),
    format: "number",
  });
}

// The charts of a page, by the name of the table each draws. The table's mark
// places a block with both.
export function chartsOf(slug: string) {
  const out: Record<string, ChartSpec> = {};
  const rules = RULES[slug] ?? {};
  for (const [name, printed] of Object.entries(tablesOf(slug))) {
    const rule = rules[name] ?? {};
    if (rule === NONE) {
      continue;
    }
    if (rule === RANGE || rule === ROLL) {
      out[name] =
        rule === RANGE
          ? rangeSpec(printed, rawTableOf(slug, name))
          : rollSpec(printed);
      continue;
    }
    const spec =
      name === "rings"
        ? rings(slug, printed)
        : specOf(
            printed,
            slug in ITEM_PAGES ? undefined : rawTableOf(slug, name),
            rule,
          );
    if (spec) {
      out[name] = spec;
    }
  }
  return out;
}
