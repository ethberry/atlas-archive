import values from "@/lib/archive/item-values.json";

// The raw values of tools and ships. The stat and upgrade tables of Statistics and
// the luck calculator all read this one file, as numbers.
export type Stat = { mean: number; q: number[] };

export type ItemClass = {
  ranges: [number, number][];
  limits?: ([number, number] | null)[];
  stats: (Stat | null)[];
  adjacent: number;
  square: number;
  // The share of each group of `figureTiers`, worst first.
  figures: number[];
};

export type ItemRow = {
  key: string;
  label: string;
  classes: ItemClass[];
  classOdds: number[][];
};

export const ITEMS = values as unknown as {
  quantiles: number[];
  classes: string[];
  toolStats: string[];
  shipStats: string[];
  tools: ItemRow[];
  ships: ItemRow[];
  raised: {
    label: string;
    key: string;
    share: [number, number];
    keepsZero: boolean;
  }[];
  staffHeads: string[];
  staffUpgraded: number[][];
  classRoll: [number, number][][][];
  // The figures of four supercharged slots by what they are worth, worst first.
  figureTiers: string[][];
  figureShapes: { figure: string; cells: [number, number][] }[];
  card: {
    beamPoints: number;
    beamRate: number;
    beamHeat: number;
    beamHeatAtlantid: number;
    beamCool: number;
    boltPoints: number;
    boltStep: number;
    scanner: number;
  };
  // The terms of a ship's bare Manoeuvrability (`CalculateShipStatEngines`):
  // the hull term by type key, `otherHull` for the rest, and by class the class
  // term and the constant and weights of the two draws.
  agile: {
    hulls: Record<string, number>;
    otherHull: number;
    robotScale: number;
    curve: number;
    classes: number[];
    offsets: [number, number, number][];
  };
};

const MEDIAN = ITEMS.quantiles.indexOf(0.5);

export function ends(stat: Stat): [number, number] {
  return [stat.q[0], stat.q[stat.q.length - 1]];
}

export function median(stat: Stat) {
  return stat.q[MEDIAN];
}

export function toolRow(key: string) {
  return ITEMS.tools.find((row) => row.key === key) as ItemRow;
}

// The share of items at or under `value`. A value many items share reads the middle
// of them.
export function percentile(stat: Stat, value: number) {
  const { q } = stat;
  const shares = ITEMS.quantiles;
  if (value < q[0]) {
    return 0;
  }
  if (value > q[q.length - 1]) {
    return 1;
  }
  const first = q.findIndex((point) => point >= value);
  if (q[first] === value) {
    const last = q.findLastIndex((point) => point === value);
    return (shares[first] + shares[last]) / 2;
  }
  const span = q[first] - q[first - 1];
  return (
    shares[first - 1] +
    ((value - q[first - 1]) / span) * (shares[first] - shares[first - 1])
  );
}
