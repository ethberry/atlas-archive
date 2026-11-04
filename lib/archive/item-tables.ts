import {
  ends,
  ITEMS,
  median,
  toolRow,
  type ItemRow,
  type Stat,
} from "@/lib/archive/items";
import type { StatTable } from "@/lib/archive/statistics";

const S = 3;

function range([low, high]: [number, number]) {
  if (high === 0) {
    return "0";
  }
  return low === high ? `${high}` : `${low} to ${high}`;
}

function ranges(rows: ItemRow[]) {
  return rows.map((row) => [row.label, ...row.classes[S].ranges.map(range)]);
}

function statRows(
  rows: ItemRow[],
  at: number,
  cell: (value: number) => string,
) {
  return rows.flatMap((row) => {
    const stat = row.classes[S].stats[at];
    if (!stat) {
      return [];
    }
    const [low, high] = ends(stat);
    return [
      [row.label, cell(low), cell(high), cell(stat.mean), cell(median(stat))],
    ];
  });
}

const percent = (value: number) => `${value.toFixed(1)}%`;
const plain = (value: number) => value.toFixed(1);

function multitoolStats(): Record<string, StatTable> {
  const note = "Tools found at class S in Euclid, with no module installed.";
  const head = ["Type", "Lowest", "Highest", "Mean", "Median"];
  const rows = (at: number) => statRows(ITEMS.tools, at, percent);
  return {
    ranges: {
      head: ["Type", "Damage", "Mining", "Scanner"],
      rows: ranges(ITEMS.tools),
      note: "What the game allows at class S, in percent.",
    },
    damage: {
      head,
      rows: rows(0),
      note: `${note} Pistols have no base damage.`,
    },
    mining: {
      head,
      rows: rows(1),
      note: `${note} Rifles have no base mining.`,
    },
    scanner: { head, rows: rows(2), note },
  };
}

function shipStats(): Record<string, StatTable> {
  const note =
    "Ships found at class S and claimed, bare, while you fly that ship, in Euclid.";
  const head = ["Ship", "Lowest", "Highest", "Mean", "Median"];
  const rows = (at: number) => statRows(ITEMS.ships, at, plain);
  return {
    ranges: {
      head: ["Ship", "Damage", "Shield", "Hyperdrive", "Maneuverability"],
      rows: ranges(ITEMS.ships),
      note: "What the game allows at class S, in percent.",
    },
    damage: {
      head,
      rows: rows(0),
      note: `${note} Explorers have no base damage.`,
    },
    shield: { head, rows: rows(1), note },
    hyperdrive: {
      head,
      rows: rows(2),
      note: `${note} Fighters have no base hyperdrive.`,
    },
    agile: { head, rows: rows(3), note },
  };
}

// A share, one decimal, with no `.0` unless the row keeps it.
function trimmed(value: number, keepsZero = false) {
  const text = value.toFixed(1);
  return `${keepsZero ? text : text.replace(/\.0$/, "")}%`;
}

function foundBand(stat: Stat) {
  const [low, high] = ends(stat);
  return `${trimmed(low)} to ${trimmed(high)}`;
}

function raised(): Record<string, StatTable> {
  const rows = ITEMS.raised.map((row) => {
    const held = toolRow(row.key).classes[S];
    const [low, high] = held.ranges[0];
    const place = (share: number) => low + share * (high - low);
    return [
      row.label,
      `${trimmed(place(row.share[0]), row.keepsZero)} to ${trimmed(place(row.share[1]), row.keepsZero)}`,
      foundBand(held.stats[0] as Stat),
    ];
  });
  const staff = toolRow("staff").classes[S].stats[0] as Stat;
  rows.push(["Staff", percent(ITEMS.staffUpgraded[S][0]), foundBand(staff)]);
  return {
    raised: {
      head: ["Type", "Upgraded to S", "Found at S"],
      rows,
      note: "Base damage at class S. A pistol has none.",
    },
  };
}

// The tables of a page that lives in the item values.
export function itemTables(slug: string): Record<string, StatTable> {
  switch (slug) {
    case "multitool-stats":
      return multitoolStats();
    case "ship-stats":
      return shipStats();
    case "multitool-upgrades":
      return raised();
    default:
      return {};
  }
}

// The numbers of a page's text that live in the item values.
export function itemNumbers(slug: string): Record<string, string> {
  if (slug === "multitool-upgrades") {
    const [damage, mining, scanner] = ITEMS.staffUpgraded[S];
    return {
      staffDamage: percent(damage),
      staffMining: percent(mining),
      staffScanner: percent(scanner),
    };
  }
  if (slug !== "ship-stats") {
    return {};
  }
  const names = ITEMS.shipStats;
  const out: Record<string, string> = {};
  for (const row of ITEMS.ships) {
    row.classes[S].stats.forEach((stat, at) => {
      if (stat) {
        const name = `${names[at]}${row.label}`;
        const [low, high] = ends(stat);
        out[`${name}Low`] = plain(low);
        out[`${name}High`] = plain(high);
        out[`${name}Median`] = plain(median(stat));
      }
    });
  }
  return out;
}
