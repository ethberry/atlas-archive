// The paint of a ship that has one: up to three bands, the hull, the trim, and a
// third the living ship's cockpit family takes, a scheme that says what each band
// takes, and a colour of the band's palette for each band the scheme leaves open
// (docs/ships/interceptors.md, The colour pick, and docs/ships/living-ships.md,
// Colours, in crimson-orb).

export type Band = "hull" | "trim" | "third";

export type Scheme = {
  id: string;
  // A react-intl id.
  label: string;
  // Which bands the player picks a colour for.
  hull: boolean;
  trim: boolean;
  third?: boolean;
};

// A colour pick: a cell of the band's palette for each band, null until the
// player picks it.
export type Paint = {
  scheme: number | null;
  hull: number | null;
  trim: number | null;
  third: number | null;
};

export const NO_PAINT: Paint = {
  scheme: null,
  hull: null,
  trim: null,
  third: null,
};

// One layer of a texture the page bakes as the game's bake shader does: its maps
// `layer-<map>.png` and `layer-<map>.alpha.png` in the ship's folder, its average
// colour, and the colour it is recoloured to, null where it keeps its own (palette
// `None`). Written by crimson-orb `utils/tools/ship_art` (`bake.py`).
export type BakeLayer = {
  map: string;
  average: number[];
  colour: string | null;
};

// What the texture needs: its layers, bottom first.
export type Painted = {
  layers: BakeLayer[];
};

// A layer of `map`, with its average colour from the ship's looks file.
export function bakeLayer(
  averages: Record<string, number[]>,
  map: string,
  colour: string | null,
): BakeLayer {
  return { map, average: averages[map], colour };
}

// The colours of one band, rows of `row`, and the react-intl id of its title.
export type BandPalette = {
  palette: string[];
  row: number;
  label: string;
};

export type ShipPaint = {
  // Every colour the game paints a band with, in the game's order, rows of `row`.
  palette: string[];
  row: number;
  // A band with colours of its own; the others take `palette`.
  bands?: Partial<Record<Band, BandPalette>>;
  schemes: Scheme[];
  // The paint of a whole pick, or null while a colour it needs is missing.
  paintedOf: (paint: Paint) => Painted | null;
  // The band colours of a pick, for a swatch; null where none is picked.
  bandsOf: (paint: Paint) => (string | null)[];
  // The paint whose light shades a grey ship and the tiles (`toneAt`).
  tone: Painted;
  // A react-intl id: the note under the palette.
  note: string;
};
