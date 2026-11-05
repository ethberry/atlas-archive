import { ITEMS, percentile, toolRow, type ItemRow } from "@/lib/archive/items";

// How lucky an item is, from 0 to 100. Each stat and the slots give the share of
// items of that type and class that beat it, and the shares combine by
// Stouffer's method, so a poor stat pulls the score down as far as a great one
// lifts it: `docs/luck.md` has the reasons. Stats are never added up.

export type Cell = [number, number];

export type Reading =
  | { field: string; kind: "above" | "below" }
  | { field: string; kind: "ok"; better: number };

export type Luck = {
  score: number | null;
  readings: Reading[];
  slots: "none" | "partial" | "scattered" | "adjacent" | "square";
  // Tools only.
  found: "unknown" | "found" | "upgraded" | "upgradedStaff";
};

// How far a typed percent may sit outside a row and still count as inside it:
// the game prints a card to one decimal, so a base read back from it can be
// off by about 0.05%.
const NEAR = 0.06;

// How far a ship's card number may sit outside its row and still count: the
// card prints one decimal, so a number on the edge can read 0.1 past it.
export const CARD_NEAR = 0.1;

// The smallest share the score uses, at either end: the stat tables hold 21
// percentiles (`stats.bin`), so they cannot tell apart shares under 0.5%.
const LEAST = 0.005;

// The normal distribution, by the published approximations: no library holds
// them in the browser.
//
// Cumulative share: Abramowitz and Stegun, Handbook of Mathematical Functions,
// formula 26.2.17, good to 7.5e-8. `NORMAL_DENSITY` is 1 / √(2π).
const NORMAL_DENSITY = 0.3989422804014327;
const AS_P = 0.2316419;
const AS_B = [0.31938153, -0.356563782, 1.781477937, -1.821255978, 1.330274429];

function normalShare(z: number) {
  const t = 1 / (1 + AS_P * Math.abs(z));
  const d = NORMAL_DENSITY * Math.exp((-z * z) / 2);
  const polynomial = AS_B.reduceRight((sum, b) => sum * t + b, 0) * t;
  const tail = d * polynomial;
  return z >= 0 ? 1 - tail : tail;
}

// Inverse: Peter Acklam's rational approximation (2003), good to 1.15e-9. Its
// coefficients `a`–`d` and the break between the middle and the tails,
// `ACKLAM_LOW`, are his.
const ACKLAM_A = [
  -39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269,
  -30.66479806614716, 2.506628277459239,
];
const ACKLAM_B = [
  -54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972,
  -13.28068155288572,
];
const ACKLAM_C = [
  -0.007784894002430293, -0.3223964580411365, -2.400758277161838,
  -2.549732539343734, 4.374664141464968, 2.938163982698783,
];
const ACKLAM_D = [
  0.007784695709041462, 0.3224671290700398, 2.445134137142996,
  3.754408661907416,
];
const ACKLAM_LOW = 0.02425;

function normalPoint(share: number): number {
  const [a, b, c, d, low] = [
    ACKLAM_A,
    ACKLAM_B,
    ACKLAM_C,
    ACKLAM_D,
    ACKLAM_LOW,
  ];
  if (share < low) {
    const q = Math.sqrt(-2 * Math.log(share));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
  if (share > 1 - low) {
    return -normalPoint(1 - share);
  }
  const q = share - 0.5;
  const r = q * q;
  return (
    ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) *
      q) /
    (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
  );
}

// Stouffer's method: each tail, the share that beats the item, becomes a point
// of the normal distribution, high for a small tail and low for a large one,
// and the points add up over the square root of their count. A stat at the
// bottom cancels one at the top. The result is the share of random items the
// whole beats.
function combined(tails: number[]) {
  const sum = tails.reduce((total, tail) => total + normalPoint(1 - tail), 0);
  return normalShare(sum / Math.sqrt(tails.length));
}

// A figure is the four supercharged slots of class S: only all four make one.
const FIGURE = 4;

function shapeOf(cells: Cell[]) {
  if (cells.length !== FIGURE) {
    return cells.length ? "partial" : "none";
  }
  const key = ([x, y]: Cell) => `${x},${y}`;
  const held = new Set(cells.map(key));
  const seen = new Set([key(cells[0])]);
  const stack = [cells[0]];
  while (stack.length) {
    const [x, y] = stack.pop() as Cell;
    for (const next of [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ] as Cell[]) {
      if (held.has(key(next)) && !seen.has(key(next))) {
        seen.add(key(next));
        stack.push(next);
      }
    }
  }
  if (seen.size < FIGURE) {
    return "scattered";
  }
  const xs = cells.map((cell) => cell[0]);
  const ys = cells.map((cell) => cell[1]);
  const square =
    Math.max(...xs) - Math.min(...xs) === 1 &&
    Math.max(...ys) - Math.min(...ys) === 1;
  return square ? "square" : "adjacent";
}

// The letter of four touching cells, by the placements the counts are kept
// under.
function figureOf(cells: Cell[]) {
  const left = Math.min(...cells.map((cell) => cell[0]));
  const top = Math.min(...cells.map((cell) => cell[1]));
  const key = (held: Cell[]) =>
    held
      .map(([x, y]) => `${x},${y}`)
      .sort()
      .join(" ");
  const moved = key(cells.map(([x, y]) => [x - left, y - top] as Cell));
  return ITEMS.figureShapes.find((shape) => key(shape.cells) === moved)?.figure;
}

// The share whose slots are worth more, with half of those worth the same.
// What a figure is worth is the Damage Potential it gives a weapon and its
// modules, so the figures stand in groups, worst first (`figureTiers`), and four
// slots that do not touch are worth less than any figure.
function slotTail(
  shape: Luck["slots"],
  cells: Cell[],
  row: ItemRow,
  klass: number,
): number | null {
  const { adjacent, figures } = row.classes[klass];
  if (adjacent === 0) {
    return null;
  }
  if (shape === "scattered") {
    return adjacent + (1 - adjacent) / 2;
  }
  if (shape !== "adjacent" && shape !== "square") {
    return null;
  }
  const letter = figureOf(cells);
  const tier = ITEMS.figureTiers.findIndex(
    (letters) => letter !== undefined && letters.includes(letter),
  );
  if (tier < 0) {
    return null;
  }
  const above = figures
    .slice(tier + 1)
    .reduce((total, share) => total + share, 0);
  return above + figures[tier] / 2;
}

function scoreOf(tails: number[]) {
  if (!tails.length) {
    return null;
  }
  // A tail stops at the resolution of the table, at both ends.
  const held = tails.map((tail) => Math.min(1 - LEAST, Math.max(tail, LEAST)));
  return Math.round(100 * combined(held));
}

// How far, as a share of the range, a damage may sit past the edge of a class
// band and still count inside it: the class draw and the damage draw are one
// number printed to a few digits, so the edges blur by about 0.1%.
const BAND_EDGE = 0.002;

// True when the damage could have come with the class: a found tool's class and
// damage read one draw, so a class holds only its bands of the range.
function foundDamage(
  value: number,
  range: [number, number],
  klass: number,
  slack: number,
) {
  const [low, high] = range;
  const share = (value - low) / (high - low);
  const edge = Math.max(BAND_EDGE, slack / (high - low));
  return ITEMS.classRoll.some((wealth) =>
    wealth[klass].some(
      ([start, end]) => share >= start - edge && share <= end + edge,
    ),
  );
}

// A base stat read back from a number the game shows, in percent, and how far
// the true value may lie from it: a card rounds, and damage truncates.
export type FromCard = { value: number; slack: number };

// The scanner of a bare tool: `SCANNER` metres times (1 + base%), the range of
// the starter scanner (`docs/item-stats.md`, What a card adds).
const SCANNER = 200;

// A card prints one decimal.
function oneDecimalCard(value: number) {
  return Math.round(value * 10) / 10;
}

// The Scanner Range a bare tool shows at a base of `percent`.
export function scannerCard(percent: number) {
  return oneDecimalCard(SCANNER * (1 + percent / 100));
}

// Scanner Range of a tool with no module: 200 × (1 + base%).
export function scannerFromCard(card: number): FromCard {
  return { value: (card / SCANNER - 1) * 100, slack: NEAR };
}

// Damage Potential of a tool with no module is its best weapon
// (`GetMaxDamagePerSecond`, `docs/item-stats.md`, What a card adds). Each is
// whole damage points, `trunc(points × (1 + base%))`, times the weapon's rate:
//
// - Boltcaster (`BOLT` tech): 180 points; rate 7.4875, its 7.5 shots a second
//   over a clip of 64 and a reload of 0.8 s.
// - Mining beam (`LASER` tech): 20 points; rate 16.667, 20 ticks a second over
//   a heat of 8 against the overheat time; an Atlantid's beam holds a heat of
//   12, so its rate is 17.647.
//
// The two read far apart, from about 330 for a beam to over 1300 for a
// Boltcaster, so `BOLT_FROM` tells which a card is.
const BOLT: [number, number] = [180, 7.4875];
const BEAM_POINTS = 20;
const BEAM_RATE = 16.667;
const ATLANTID_BEAM_RATE = 17.647;
const BOLT_FROM = 900;

// A tiny step past a whole point, so a card that lands on one exactly is not
// read one point short by floating-point error.
const WHOLE = 1e-6;

function beam(type: string): [number, number] {
  return [BEAM_POINTS, type === "atlantid" ? ATLANTID_BEAM_RATE : BEAM_RATE];
}

// The Damage Potential a bare tool of `type` shows at a base of `percent`:
// every recorded Atlantid shows its beam, every other type its Boltcaster.
// The game prints it to one decimal.
export function damageCard(percent: number, type: string) {
  const [points, factor] = type === "atlantid" ? beam(type) : BOLT;
  return oneDecimalCard(
    Math.floor(points * (1 + percent / 100) + WHOLE) * factor,
  );
}

// The base back from the card: the whole points it holds, and their middle,
// since the truncation hides where in the point the base lies; half a point
// is the slack.
export function damageFromCard(card: number, type: string): FromCard {
  const bolt = card >= BOLT_FROM;
  const [points, factor] = bolt ? BOLT : beam(type);
  const whole = Math.floor(card / factor + WHOLE);
  return {
    value: ((whole + 0.5) / points - 1) * 100,
    slack: (0.5 / points) * 100 + NEAR,
  };
}

type ToolEntry = {
  type: string;
  klass: number;
  cells: Cell[];
  damage: FromCard | null;
  scanner: FromCard | null;
};

export function toolLuck(entry: ToolEntry): Luck {
  const { type, klass, cells } = entry;
  const row = toolRow(type);
  const held = row.classes[klass];
  // Mining shows on no card, so it is never asked.
  const read = [entry.damage, null, entry.scanner];
  const entries = read.map((reading) => reading?.value ?? null);
  const slack = read.map((reading) => reading?.slack ?? NEAR);
  const readings: Reading[] = [];
  const tails: number[] = [];
  const shape = shapeOf(cells);
  const staffBase = ITEMS.staffUpgraded[klass];
  const entered = entries.filter((value) => value !== null).length;
  const upgradedStaff =
    type === "staff" &&
    // Two stats on the one base an upgraded staff holds are no chance: one
    // could be.
    entered >= 2 &&
    entries.every(
      (value, at) =>
        value === null || Math.abs(value - staffBase[at]) <= slack[at],
    );
  let found: Luck["found"] = upgradedStaff ? "upgradedStaff" : "unknown";
  entries.forEach((value, at) => {
    if (value === null) {
      return;
    }
    const field = ITEMS.toolStats[at];
    const [low, high] = held.ranges[at];
    if (value > high + slack[at]) {
      readings.push({ field, kind: "above" });
      return;
    }
    if (value < low - slack[at]) {
      readings.push({ field, kind: "below" });
      return;
    }
    const stat = held.stats[at];
    if (!stat || low === high) {
      return;
    }
    const share = percentile(stat, Math.min(high, Math.max(low, value)));
    if (!upgradedStaff) {
      readings.push({ field, kind: "ok", better: share });
    }
    tails.push(upgradedStaff ? 1 : 1 - share);
    if (at === 0 && !upgradedStaff && high > low) {
      found = foundDamage(value, [low, high], klass, slack[at])
        ? "found"
        : "upgraded";
    }
  });
  const slot = slotTail(shape, cells, row, klass);
  if (slot !== null) {
    tails.push(slot);
  }
  const wrong = readings.some((row) => row.kind !== "ok");
  return {
    score: wrong ? null : scoreOf(tails),
    readings,
    slots: shape,
    found,
  };
}

type ShipEntry = {
  type: string;
  klass: number;
  cells: Cell[];
  stats: (number | null)[];
};

export function shipLuck(entry: ShipEntry): Luck {
  const { type, klass, cells, stats } = entry;
  const row = ITEMS.ships.find((ship) => ship.key === type) as ItemRow;
  const held = row.classes[klass];
  const readings: Reading[] = [];
  const tails: number[] = [];
  const shape = shapeOf(cells);
  stats.forEach((value, at) => {
    if (value === null) {
      return;
    }
    const field = ITEMS.shipStats[at];
    const limit = held.limits?.[at];
    const stat = held.stats[at];
    if (!limit || !stat) {
      return;
    }
    if (value > limit[1] + CARD_NEAR) {
      readings.push({ field, kind: "above" });
      return;
    }
    if (value < limit[0] - CARD_NEAR) {
      readings.push({ field, kind: "below" });
      return;
    }
    const share = percentile(stat, value);
    readings.push({ field, kind: "ok", better: share });
    tails.push(1 - share);
  });
  const slot = slotTail(shape, cells, row, klass);
  if (slot !== null) {
    tails.push(slot);
  }
  const wrong = readings.some((row) => row.kind !== "ok");
  return {
    score: wrong ? null : scoreOf(tails),
    readings,
    slots: shape,
    found: "unknown",
  };
}
