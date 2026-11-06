import looks from "@/lib/archive/living-ship-looks.json";
import {
  bakeLayer,
  type BakeLayer,
  type Paint,
  type ShipPaint,
} from "@/lib/archive/builder/paint";

// The colour of a living ship (docs/ships/living-ships.md, Colours, in crimson-orb).
// Its crash site picks one of three looks of the hull texture (`BASEU`): fine ribs
// in a colour of `BioShip_Cockpit`, stripes in a colour of `BioShip_Body`, or black
// ridges; and a colour of `BioShip_Body` for the stripes of the shell, one of
// `BioShip_Underbelly` for the pale skin of the head and belly, and one of
// `BioShip_Cockpit` for the ribs (palettes 52, 53, and 54 of
// `BASECOLOURPALETTES.MBIN`, each colour once). The page bakes the hull texture
// from the game's maps the way the game's bake shader does (`bakeTexture` in
// `components/archive/builder/stage.ts`); the maps and `averages` are written by
// `utils/tools/ship_art/living_ship_paint.py`. The page lights it with the game's light (`GAME_LIGHT` in stage.ts).
const { body, underbelly, cockpit, averages, tiles } = looks;

// The palettes hold 16, 16, and 8 colours; rows of four, four, and eight.
const BODY_ROW = 4;
const UNDERBELLY_ROW = 4;
const COCKPIT_ROW = 8;

// The looks of the hull texture, in the game's order, and the `BASEU` map of each.
const RIBS = 0;
const STRIPES = 1;
const BLACK = 2;
const BASE_MAPS = ["baseu.3", "baseu.2", "baseu.1"] as const;

// White: the colour the grey ship and the tiles are shaded with.
const WHITE = "#ffffff";

// The layers of a paint, bottom first: the look's `BASEU` (black ridges keep their
// own colour), the skin, the flesh and the overlay in the stripe colour, and the
// top, which keeps its own.
function layersOf(
  look: number,
  stripes: string,
  skin: string,
  ribs: string,
): BakeLayer[] {
  const base = BASE_MAPS[look];
  const layer = (map: string, colour: string | null) =>
    bakeLayer(averages, map, colour);
  return [
    layer(base, [ribs, stripes, null][look]),
    layer("skin.1", skin),
    layer("flesh", stripes),
    layer("overlay.1", stripes),
    layer("top", null),
  ];
}

function paintedOf(paint: Paint) {
  const { scheme, hull, trim, third } = paint;
  if (scheme === null || hull === null || trim === null) {
    return null;
  }
  // The ribs stay white until their colour is picked, so the stripes and the skin
  // show as soon as they are.
  const ribs = third === null ? WHITE : cockpit[third];
  return { layers: layersOf(scheme, body[hull], underbelly[trim], ribs) };
}

// A tile shows a colour as the ship shows it: the baked band in the game's light
// (`tiles` in `living_ship_paint.py`).
function bandsOf(paint: Paint): (string | null)[] {
  const colour = (palette: string[], value: number | null) =>
    value === null ? null : palette[value];
  if (paint.scheme === null) {
    return [null, null];
  }
  const bands = [
    colour(tiles.body, paint.hull),
    colour(tiles.underbelly, paint.trim),
  ];
  if (paint.scheme === RIBS) {
    return [colour(tiles.cockpit, paint.third), ...bands];
  }
  return paint.scheme === BLACK ? ["#000000", ...bands] : bands;
}

export const LIVING_SHIP_PAINT: ShipPaint = {
  palette: tiles.body,
  row: BODY_ROW,
  bands: {
    hull: {
      palette: tiles.body,
      row: BODY_ROW,
      label: "archive.livingShipStripes",
    },
    trim: {
      palette: tiles.underbelly,
      row: UNDERBELLY_ROW,
      label: "archive.livingShipSkin",
    },
    third: {
      palette: tiles.cockpit,
      row: COCKPIT_ROW,
      label: "archive.livingShipRibs",
    },
  },
  schemes: [
    {
      id: "ribs",
      label: "archive.livingShipLookRibs",
      hull: true,
      trim: true,
      third: true,
    },
    {
      id: "stripes",
      label: "archive.livingShipLookStripes",
      hull: true,
      trim: true,
    },
    {
      id: "black",
      label: "archive.livingShipLookBlack",
      hull: true,
      trim: true,
    },
  ],
  paintedOf,
  bandsOf,
  tone: { layers: layersOf(STRIPES, WHITE, WHITE, WHITE) },
  note: "archive.livingShipPalette",
};
