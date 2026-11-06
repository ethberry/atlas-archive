import looks from "@/lib/archive/freighter-looks.json";
import {
  bakeLayer,
  type Paint,
  type ShipPaint,
} from "@/lib/archive/builder/paint";

// The colour of both freighters. A freighter's colours are two cells of the
// `Freighter` palette (`BASECOLOURPALETTES.MBIN`, palette 56, 64 cells in rows of
// eight): colour 2 on the panels, the hull's main colour, and colour 0 on the trim,
// its stripes and frames; the rest of the hull map is fixed. The page's hull is the
// panels. Both are one pick of the system, so the capital and the regular freighters
// of a system share them (docs/ships/freighters.md, Colours, in crimson-orb). The
// page bakes the hull map from the game's layers as the game's bake shader does
// (`bakeTexture` in `components/archive/builder/stage.ts`); the layers, the
// averages, and the swatches are written by `utils/tools/ship_art/freighter_paint.py`.
const PAINT = looks.paint;

// The palette has eight rows of eight colours.
const PALETTE_ROW = 8;

// The layers of the painted base, bottom first: the base keeps its own colour, the
// panels and the trim are recoloured. The unpainted base differs only in a teal
// block of the hull map, which no photo of a freighter shows; the game draws the
// base from the hull's model seed, which this builder has no way to know
// (docs/ships/freighters.md, in crimson-orb).
function layersOf(panels: string, trim: string) {
  return {
    layers: [
      bakeLayer(looks.averages, "base.painted", null),
      bakeLayer(looks.averages, "paint2.painted", panels),
      bakeLayer(looks.averages, "paint1", trim),
    ],
  };
}

// White, which leaves the light of a hull map as it is: its detail shades a grey ship
// and a tile.
const WHITE = "#ffffff";

function paintedOf(paint: Paint) {
  const { scheme, hull, trim } = paint;
  if (scheme === 0 && hull !== null && trim !== null) {
    return layersOf(PAINT[hull], PAINT[trim]);
  }
  return null;
}

// A tile shows a cell as the hull shows it: the baked band in the game's light
// (`swatches` in `freighter_paint.py`).
function bandsOf(paint: Paint): [string | null, string | null] {
  const colour = (palette: string[], value: number | null) =>
    value === null ? null : palette[value];
  return paint.scheme === 0
    ? [colour(looks.panels, paint.hull), colour(looks.trim, paint.trim)]
    : [null, null];
}

export const FREIGHTER_PAINT: ShipPaint = {
  palette: looks.panels,
  row: PALETTE_ROW,
  bands: {
    hull: {
      palette: looks.panels,
      row: PALETTE_ROW,
      label: "archive.finderHull",
    },
    trim: {
      palette: looks.trim,
      row: PALETTE_ROW,
      label: "archive.finderTrim",
    },
  },
  schemes: [
    { id: "two", label: "archive.freighterColours", hull: true, trim: true },
  ],
  paintedOf,
  bandsOf,
  tone: layersOf(WHITE, WHITE),
  note: "archive.freighterPalette",
};
