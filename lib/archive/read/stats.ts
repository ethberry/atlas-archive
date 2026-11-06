import { ITEMS } from "@/lib/archive/items";
import { type Field, text } from "@/lib/archive/read/common";

// The numbers that close an item's card: what it reads bare, with nothing
// installed. A stat the body or hull has no range for is null, and stays off.
function baseStats(stats: [string, number | null][]): Field[] {
  return stats.flatMap(([label, value]) =>
    value === null ? [] : [{ type: "text", label, text: value.toFixed(1) }],
  );
}

function percentOf(value: unknown) {
  return typeof value === "number" ? value / 100 : null;
}

// The card of a bare tool: the Mining Beam and the scanner, in whole beam
// points. Only an Atlantid beam runs at heat 12.
export function toolStats(tool: Record<string, unknown>): Field[] {
  const damage = percentOf(tool.base_damage) ?? 0;
  const scanner = percentOf(tool.base_scanner);
  const heat = text(tool.body)?.startsWith("atlantid") ? 12 : 8;
  const beam = (Math.trunc(20 * (1 + damage)) * 20 * heat) / (heat + 1.6);
  // A rifle has no mining range and stores none: its base is 0.
  const mining = typeof tool.base_mining === "number" ? tool.base_mining : 0;
  return [
    ...baseStats([["archive.baseDamage", beam]]),
    // The game's card shows no mining figure and the beam's own speed is not
    // read, so this row is the base itself, a percent; 0 for a rifle.
    {
      type: "text",
      label: "archive.baseMining",
      text: `${mining.toFixed(1)}%`,
    } as Field,
    ...baseStats([
      ["archive.baseScanner", scanner === null ? null : 200 * (1 + scanner)],
    ]),
  ];
}

// The card of a bare claimed ship, from `CalculateShipStat*`. The game draws
// from the seed of the ship being flown, and here that is the ship itself, so
// the two draws are its own model seed's. A row without them holds no claimed
// base, and stays off. The terms of Manoeuvrability come with the item values.
export function shipStats(ship: Record<string, unknown>): Field[] {
  const hull = text(ship.hull) ?? "";
  const rank = text(ship.class) ?? "C";
  const robot = hull === "interceptor";
  const { model_draw_1: u1, model_draw_2: u2 } = ship;
  if (typeof u1 !== "number" || typeof u2 !== "number") {
    return [];
  }
  const of = (value: unknown, card: (base: number) => number) => {
    const base = percentOf(value);
    return base === null ? null : card(base * 100);
  };
  return baseStats([
    [
      "archive.baseDamage",
      of(ship.base_damage, (base) => 33 + 4 * u1 + (base * 215) / 60),
    ],
    ["archive.baseShield", of(ship.base_shield, (base) => 165 + base / 0.85)],
    [
      "archive.baseHyperdrive",
      of(ship.base_hyperdrive, (base) => (robot ? 601 + 6 * base : 101 + base)),
    ],
    [
      "archive.baseAgile",
      of(ship.base_agile, (base) => {
        const x = 1 + base / 100;
        const { agile } = ITEMS;
        const grade = ITEMS.classes.indexOf(rank);
        const [offset, first, second] = agile.offsets[grade];
        return (
          (agile.hulls[hull] ?? agile.otherHull) +
          agile.classes[grade] +
          agile.curve * ((robot ? agile.robotScale : 1) * x * x - 1) +
          offset +
          first * u1 +
          second * u2
        );
      }),
    ],
  ]);
}
