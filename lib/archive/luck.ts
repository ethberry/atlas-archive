import { ITEMS, percentile, toolRow, type ItemRow } from "@/lib/archive/items";

// How lucky an item is, from 0 to 100. Each stat and the slots give the share of
// items of that type and class that beat it, and the shares combine by Fisher's
// method: `docs/luck.md` has the reasons. Stats are never added up.

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

const NEAR = 0.06;
const LEAST = 0.005;

// The share of random items whose combined rarity is as strong as these, for
// `tails` that are each even between 0 and 1 and independent.
function combined(tails: number[]) {
  const product = tails.reduce((sum, tail) => sum * tail, 1);
  const log = -Math.log(product);
  let term = 1;
  let sum = 1;
  for (let at = 1; at < tails.length; at += 1) {
    term *= log / at;
    sum += term;
  }
  return Math.min(1, product * sum);
}

function shapeOf(cells: Cell[]) {
  if (cells.length !== 4) {
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
  if (seen.size < 4) {
    return "scattered";
  }
  const xs = cells.map((cell) => cell[0]);
  const ys = cells.map((cell) => cell[1]);
  const square =
    Math.max(...xs) - Math.min(...xs) === 1 &&
    Math.max(...ys) - Math.min(...ys) === 1;
  return square ? "square" : "adjacent";
}

// The share that beats these slots, with half of those that tie.
function slotTail(
  shape: Luck["slots"],
  row: ItemRow,
  klass: number,
): number | null {
  const { adjacent, square } = row.classes[klass];
  if (adjacent === 0) {
    return null;
  }
  if (shape === "scattered") {
    return adjacent + (1 - adjacent) / 2;
  }
  if (shape === "adjacent") {
    return square + (adjacent - square) / 2;
  }
  return shape === "square" ? square / 2 : null;
}

function scoreOf(tails: number[]) {
  if (!tails.length) {
    return null;
  }
  const held = tails.map((tail) => Math.max(tail, LEAST));
  return Math.round(100 * (1 - combined(held)));
}

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
  const edge = Math.max(0.002, slack / (high - low));
  return ITEMS.classRoll.some((wealth) =>
    wealth[klass].some(
      ([start, end]) => share >= start - edge && share <= end + edge,
    ),
  );
}

// A base stat read back from a number the game shows, in percent, and how far
// the true value may lie from it: a card rounds, and damage truncates.
export type FromCard = { value: number; slack: number };

// Scanner Range of a tool with no module: 200 × (1 + base%).
export function scannerFromCard(card: number): FromCard {
  return { value: (card / 200 - 1) * 100, slack: 0.06 };
}

// Damage Potential of a tool with no module is its best weapon: a Boltcaster,
// 180 points times 7.4875, or a beam, 20 points times 16.667, an Atlantid's
// 17.647. The points are truncated, so the base lies within one point; the two
// weapons read far apart, so the number says which one it is
// (`docs/item-stats.md`, What a card adds).
export function damageFromCard(card: number, type: string): FromCard {
  const bolt = card >= 900;
  const [points, factor] = bolt
    ? [180, 7.4875]
    : [20, type === "atlantid" ? 17.647 : 16.667];
  const whole = Math.floor(card / factor + 1e-6);
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
  const slot = slotTail(shape, row, klass);
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
    if (value > limit[1] + 0.1) {
      readings.push({ field, kind: "above" });
      return;
    }
    if (value < limit[0] - 0.1) {
      readings.push({ field, kind: "below" });
      return;
    }
    const share = percentile(stat, value);
    readings.push({ field, kind: "ok", better: share });
    tails.push(1 - share);
  });
  const slot = slotTail(shape, row, klass);
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
