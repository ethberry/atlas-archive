import groups from "@/lib/archive/interceptor-groups.json";
import looks from "@/lib/archive/interceptor-looks.json";
import {
  bakeLayer,
  type Paint,
  type Scheme,
  type ShipPaint,
} from "@/lib/archive/builder/paint";
import type { PartGroup } from "@/lib/archive/builder/parts";
import type { ShipModule } from "@/lib/archive/builder/ship";

// The Sentinel Interceptor on /interceptor-finder, the Interceptor builder. The
// groups are the forks of the game's own tree of Interceptor parts, written by
// crimson-orb `procgen/examples/interceptor_groups.rs` (docs/ships/seed-to-picture.md).

// Colour lies on two bands of the ship: the hull (upper hull, wing tops, closed
// wings) and the trim (cockpit pad, wing edges, light skirting). A scheme says what
// each band takes, and each band takes one of the 64 colours of `PAINT` in crimson-orb
// `ship/interceptor.rs`, the colours the game paints with, in the game's own order:
// eight rows of eight, a few colours twice (the owner, 2026-11-05). A tile shows each
// as it looks on the ship (`hull`, `trim` of the looks file).
const PAINT = looks.paint;

// The game's palette has eight rows of eight colours (`BASECOLOURPALETTES.MBIN`,
// palette 10).
const PALETTE_ROW = 8;

const SCHEMES: Scheme[] = [
  {
    id: "sentinel",
    label: "archive.interceptorSentinel",
    hull: false,
    trim: false,
  },
  { id: "white", label: "archive.interceptorWhite", hull: true, trim: false },
  { id: "black", label: "archive.interceptorBlack", hull: false, trim: true },
  { id: "two", label: "archive.interceptorTwo", hull: true, trim: true },
];

// The paint of a whole pick, as `bake` in crimson-orb `utils/tools/ship_art`
// (`interceptor.py`) bakes it: `BASE` in the primary, an overlay, and `FIXED`.
// Overlay 1 is Sentinel orange over white, 2 a hull colour and white trim, 3 a
// black hull and trim colour, 4 a hull colour and a trim colour
// (`InterceptorPaint::look`): there `BASE` takes the trim colour and the overlay,
// the only one recoloured, the hull colour.
function layersOf(option: number, primary: string, secondary: string | null) {
  return {
    layers: [
      bakeLayer(looks.averages, "base.1", primary),
      bakeLayer(looks.averages, `overlay.${option}`, secondary),
      bakeLayer(looks.averages, "fixed.1", null),
    ],
  };
}

function paintedOf(paint: Paint) {
  const { scheme, hull, trim } = paint;
  if (scheme === 0) {
    return layersOf(1, PAINT[0], null);
  }
  if (scheme === 1 && hull !== null) {
    return layersOf(2, PAINT[hull], null);
  }
  if (scheme === 2 && trim !== null) {
    return layersOf(3, PAINT[trim], null);
  }
  if (scheme === 3 && hull !== null && trim !== null) {
    return layersOf(4, PAINT[trim], PAINT[hull]);
  }
  return null;
}

// A tile shows a colour as the ship shows it: the baked band in the game's light
// (`write_looks` in crimson-orb `ship_art/interceptor.py`).
function bandsOf(paint: Paint): [string | null, string | null] {
  const colour = (palette: string[], value: number | null) =>
    value === null ? null : palette[value];
  switch (paint.scheme) {
    case 0:
      return [looks.sentinel[0], looks.sentinel[1]];
    case 1:
      return [colour(looks.hull, paint.hull), looks.white];
    case 2:
      return [looks.black, colour(looks.trim, paint.trim)];
    case 3:
      return [colour(looks.hull, paint.hull), colour(looks.trim, paint.trim)];
    default:
      return [null, null];
  }
}

const INTERCEPTOR_PAINT: ShipPaint = {
  palette: looks.hull,
  row: PALETTE_ROW,
  bands: {
    hull: {
      palette: looks.hull,
      row: PALETTE_ROW,
      label: "archive.finderHull",
    },
    trim: {
      palette: looks.trim,
      row: PALETTE_ROW,
      label: "archive.finderTrim",
    },
  },
  schemes: SCHEMES,
  paintedOf,
  bandsOf,
  // A white hull and white trim: its light darkens a grey ship and a tile where
  // the ship is black, so black and light plates of one shape tell apart.
  tone: layersOf(2, PAINT[0], null),
  note: "archive.finderPalette",
};

export const INTERCEPTOR: ShipModule = {
  kind: "interceptor",
  folder: "/interceptor",
  format: "textured",
  groups: groups as PartGroup[],
  // The landing gear stands on every ship but one on the walker legs: they take
  // its place (the owner, 2026-11-05). Its layer is cut from `base` by crimson-orb
  // `utils/tools/ship_art` (`interceptor.py`) (`LANDING_GEAR`).
  always: [{ layer: "_LandGear", unless: "_WingsU_Legs" }],
  paint: INTERCEPTOR_PAINT,
  label: "archive.interceptorShip",
};
