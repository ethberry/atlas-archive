"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import MuiLink from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { FormattedMessage } from "react-intl";

import { Article } from "@/components/archive/Article";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  NO_PAINT,
  PART_GROUPS,
  SCHEMES,
  bandsOf,
  firstOf,
  paintedOf,
  optionOf,
  settled,
  PAINT,
  type Paint,
  type Painted,
  type PartChoice,
  type PartGroup,
} from "@/lib/archive/interceptor-parts";
import { guidePath } from "@/lib/archive/guides";

type TreePart = { name: string; groups: TreePart[][] };

type Parts = {
  width: number;
  height: number;
  layers: Record<string, [number, number, number, number]>;
  tree: TreePart[][];
};

// The stage: the shade of each pixel and the form group that stands there.
type Stage = {
  shade: Uint8Array;
  group: Int8Array;
  // Where each pixel reads the look's texture; `textureU` 0 reads none.
  textureU: Uint8Array;
  textureV: Uint16Array;
  width: number;
  height: number;
};

const LAYERS = "/interceptor";
// Lights and glass read no texture.
const LENS = 34;
// One calm surface for the ship and the tiles, in either theme.
const SURFACE = "#e7e8ea";
const INK = "#1d2026";
const MARK = "#c8561b";
const GLYPH_WIDTH = 1.04;
const TILE = {
  flexDirection: "column",
  gap: 0.5,
  width: 132,
  bgcolor: "#f4f4f5",
  color: INK,
  border: "1px solid #c4c7cc !important",
  "&:hover": { bgcolor: "#f4f4f5", borderColor: "#8c9096 !important" },
  "&.Mui-selected, &.Mui-selected:hover": {
    bgcolor: "#f4f4f5",
    color: INK,
    outline: `3px solid ${MARK}`,
    outlineOffset: -1,
  },
  "&.Mui-disabled": { color: "#70747b", opacity: 0.55 },
};
const NOT_A_GROUP = -1;
// The landing gear stands on every ship but one on the walker legs: they take its
// place (the owner, 2026-11-05). Its layer is cut from `base` by crimson-orb
// `utils/tools/interceptor_art.py` (`LANDING_GEAR`).
const LANDING_GEAR = "_LandGear";
const WALKER_LEGS = "_WingsU_Legs";
const HIDDEN = -2;

// The picks after `option` is set in `group`: the parts it hangs on come in, the
// groups that hung on the old option go out, and the groups of the new one start
// on their empty or first option.
function pick(
  choice: PartChoice,
  group: PartGroup,
  option: string,
): PartChoice {
  const next = { ...choice, [group.id]: option };
  // What it hangs on, and what that hangs on in turn: the upper wings of a Pod
  // need the Pod, and the Pod needs the Carriage wing set.
  for (
    let needs = group.requires;
    needs;
    needs = PART_GROUPS.find((row) => row.id === needs?.group)?.requires
  ) {
    next[needs.group] = needs.option;
  }
  return opened(settled(next), group, option);
}

// Two options of one group that can both vanish draw one picture, nothing, as
// Stacked and Spread with no wings. So when the player picks one of them and all
// its groups stand empty, the first of them takes `firstOf`, and the pick shows on
// the ship. Frame vanishes too, but Plated beside it never does: leaving the plates
// already shows.
function opened(choice: PartChoice, group: PartGroup, option: string) {
  const twins = group.options.filter((row) => row.vanishes);
  if (!twins.some((row) => row.id === option) || twins.length < 2) {
    return choice;
  }
  const children = PART_GROUPS.filter(
    (row) => row.requires?.group === group.id && row.requires.option === option,
  );
  if (children.some((row) => !optionOf(row, choice[row.id])?.empty)) {
    return choice;
  }
  for (const row of children) {
    const first = firstOf(row);
    if (first) {
      return pick(choice, row, first.id);
    }
  }
  return choice;
}

// The ship before any pick: every group on its empty or first option, opened where
// that option vanishes beside another that does.
const START = PART_GROUPS.reduce(
  (choice, row) =>
    choice[row.id] === undefined ? choice : opened(choice, row, choice[row.id]),
  settled({}),
);

// The groups that hang on `group`, at any depth, and `group` itself, by index.
// Groups come parent first, so one pass finds them all.
function branchOf(group: PartGroup) {
  const out = new Set([PART_GROUPS.indexOf(group)]);
  PART_GROUPS.forEach((row, index) => {
    const parent = PART_GROUPS.findIndex((up) => up.id === row.requires?.group);
    if (out.has(parent)) {
      out.add(index);
    }
  });
  return out;
}

// The form group of each part name.
const GROUP_OF = new Map(
  PART_GROUPS.flatMap((group, index) =>
    group.options.flatMap((option) =>
      option.names.map((name) => [name, index] as const),
    ),
  ),
);

// The name of each chip: its title, and where another group that applies has the
// same title (each set of wings has its own Plate shade), the title of the group it
// hangs on, then a number.
function chipNames(fits: PartGroup[]) {
  const title = (row: PartGroup) => {
    const same = fits.filter((other) => other.title === row.title);
    const parent = PART_GROUPS.find((up) => up.id === row.requires?.group);
    return same.length > 1 && parent
      ? `${row.title} · ${parent.title}`
      : row.title;
  };
  const names = new Map(fits.map((row) => [row.id, title(row)]));
  const seen = new Map<string, number>();
  for (const row of fits) {
    const name = names.get(row.id) as string;
    if (fits.filter((other) => names.get(other.id) === name).length > 1) {
      const count = (seen.get(name) ?? 0) + 1;
      seen.set(name, count);
      names.set(row.id, `${name} ${count}`);
    }
  }
  return names;
}

// The first part that shows anything stands in for a group nobody picked.
function standIn(group: TreePart[]) {
  return (
    group.find((part) => !/null|non/i.test(part.name.slice(0, 40))) ?? group[0]
  );
}

// True when `part`, or a part under it, is a filled part of the picks.
function holds(part: TreePart, wanted: Set<string>): boolean {
  return (
    (wanted.has(part.name) && !/null/i.test(part.name)) ||
    part.groups.some((group) => group.some((row) => holds(row, wanted)))
  );
}

// The layers of a ship with these picks, each with its form group.
function layersOf(tree: TreePart[][], choice: PartChoice) {
  const wanted = new Set(
    PART_GROUPS.flatMap(
      (group) => optionOf(group, choice[group.id])?.names ?? [],
    ),
  );
  const out: [string, number][] = [["base", NOT_A_GROUP]];
  if (!wanted.has(WALKER_LEGS)) {
    out.push([LANDING_GEAR, NOT_A_GROUP]);
  }
  const walk = (groups: TreePart[][], owner: number) => {
    for (const group of groups) {
      // One pick may name an empty part of a group another pick fills, here or
      // further down: "no side engines" names `_Engine_NULL2`, and the rear engine
      // fills that group; "no side fins" names `_SkirtWings_NULL`, and a skirting
      // plate under `_SkirtWings_A` fills it.
      const part =
        group.find((row) => holds(row, wanted)) ??
        group.find((row) => wanted.has(row.name)) ??
        standIn(group);
      const here = GROUP_OF.get(part.name) ?? owner;
      out.push([part.name, here]);
      walk(part.groups, here);
    }
  };
  walk(tree, NOT_A_GROUP);
  return out;
}

const images = new Map<string, Promise<ImageData>>();

async function loadLayer(name: string, tries = 3): Promise<ImageData> {
  try {
    const response = await fetch(`${LAYERS}/${encodeURIComponent(name)}.png`);
    if (!response.ok) {
      throw new Error(name);
    }
    const bitmap = await createImageBitmap(await response.blob(), {
      colorSpaceConversion: "none",
      premultiplyAlpha: "none",
    });
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      throw new Error("No canvas.");
    }
    context.drawImage(bitmap, 0, 0);
    return context.getImageData(0, 0, bitmap.width, bitmap.height);
  } catch (error) {
    if (tries > 1) {
      return loadLayer(name, tries - 1);
    }
    throw error;
  }
}

// A load that fails leaves the cache, so the next picture asks again.
function layerImage(name: string) {
  let image = images.get(name);
  if (!image) {
    image = loadLayer(name).catch((error: unknown) => {
      images.delete(name);
      throw error;
    });
    images.set(name, image);
  }
  return image;
}

// What a tile shows: the ship with this option picked, kept to the group and the
// groups that hang on it.
function optionLayers(
  parts: Parts,
  group: PartGroup,
  option: string,
): [string, number][] {
  const branch = branchOf(group);
  const layers = layersOf(parts.tree, pick(START, group, option)).filter(
    ([name]) => parts.layers[name],
  );
  const own = layers.filter(([, owner]) => branch.has(owner));
  // An option that draws nothing in its branch, as Frame, shows the ship it
  // leaves: the parts every Interceptor carries, without the landing gear, which
  // both hulls carry.
  return (
    own.length
      ? own
      : layers.filter(
          ([name, owner]) => owner === NOT_A_GROUP && name !== LANDING_GEAR,
        )
  ).map(([name]) => [name, NOT_A_GROUP]);
}

// Lays the layers over each other: the nearest pixel wins, as on the ship.
async function buildStage(
  parts: Parts,
  layers: [string, number][],
): Promise<Stage> {
  const { width, height } = parts;
  const shade = new Uint8Array(width * height);
  const depth = new Uint8Array(width * height);
  const group = new Int8Array(width * height).fill(HIDDEN);
  const textureU = new Uint8Array(width * height);
  const textureV = new Uint16Array(width * height);
  const rows = layers.filter(([name]) => parts.layers[name]);
  const pictures = await Promise.all(rows.map(([name]) => layerImage(name)));
  const textures = await Promise.all(
    rows.map(([name]) => layerImage(`${name}.uv`)),
  );
  rows.forEach(([name, owner], index) => {
    const [left, top, across, down] = parts.layers[name];
    const { data } = pictures[index];
    const texture = textures[index].data;
    for (let y = 0; y < down; y += 1) {
      for (let x = 0; x < across; x += 1) {
        const from = (y * across + x) * 4;
        if (data[from + 3] === 0) {
          continue;
        }
        const to = (top + y) * width + left + x;
        if (group[to] === HIDDEN || data[from + 1] >= depth[to]) {
          shade[to] = data[from];
          depth[to] = data[from + 1];
          group[to] = owner;
          textureU[to] = texture[from];
          textureV[to] = (texture[from + 1] << 8) | texture[from + 2];
        }
      }
    }
  });
  return { shade, group, textureU, textureV, width, height };
}

// An image of the site as pixels.
async function pixels(name: string) {
  const response = await fetch(`${LAYERS}/${name}`);
  const bitmap = await createImageBitmap(await response.blob(), {
    colorSpaceConversion: "none",
    premultiplyAlpha: "none",
  });
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("No canvas.");
  }
  context.drawImage(bitmap, 0, 0);
  return context.getImageData(0, 0, bitmap.width, bitmap.height);
}

// The maps of each overlay: `paint-N.png` holds what the colours multiply (the base
// light and the overlay light, both over LIGHT_RANGE, and how much of the base
// shows), `paint-N.rest.png` what stays, and `paint-4.cover.png` how much of the
// hull colour shows on overlay 4; written by crimson-orb `interceptor_art.py`
// (`paint_maps`).
const maps = new Map<number, Promise<ImageData[]>>();
const LIGHT_RANGE = 2;
// The overlay with a hull colour and a trim colour.
const OVERLAY_TWO = 4;

function mapsOf(option: number) {
  let found = maps.get(option);
  if (!found) {
    found = Promise.all([
      pixels(`paint-${option}.png`),
      pixels(`paint-${option}.rest.png`),
      ...(option === OVERLAY_TWO ? [pixels("paint-4.cover.png")] : []),
    ]).catch((error: unknown) => {
      maps.delete(option);
      throw error;
    });
    maps.set(option, found);
  }
  return found;
}

const rgb = (hex: string) =>
  [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16) / 255);

const textures = new Map<string, Promise<ImageData>>();

// The texture of a paint: per texel, the primary times the base light where the
// overlay leaves the base, the secondary times the overlay light where overlay 4
// covers it, and what stays (`painted` in `interceptor_art.py`).
function paintTexture(painted: Painted) {
  const key = `${painted.option}:${painted.primary}:${painted.secondary}`;
  let image = textures.get(key);
  if (!image) {
    image = mapsOf(painted.option).then(([weights, rest, cover]) => {
      const primary = rgb(painted.primary);
      const secondary = painted.secondary ? rgb(painted.secondary) : null;
      const out = new ImageData(weights.width, weights.height);
      const { data: w } = weights;
      for (let at = 0; at < w.length; at += 4) {
        const base = (w[at] / 255) * LIGHT_RANGE;
        const over = (w[at + 1] / 255) * LIGHT_RANGE;
        for (let channel = 0; channel < 3; channel += 1) {
          let value =
            Math.min(1, base * primary[channel]) * (w[at + 2] / 255) +
            rest.data[at + channel] / 255;
          if (secondary && cover) {
            value +=
              Math.min(1, over * secondary[channel]) * (cover.data[at] / 255);
          }
          out.data[at + channel] = Math.min(255, value * 255);
        }
        out.data[at + 3] = 255;
      }
      return out;
    });
    image.catch(() => textures.delete(key));
    textures.set(key, image);
  }
  return image;
}

// The paint whose light darkens a tile or a grey ship where the ship is black: a
// white hull and white trim, so black and light plates of one shape tell apart.
const TONE: Painted = { option: 2, primary: PAINT[0], secondary: null };

// The light of the White paint at `at`, 1 where the pixel reads no texture: black
// plates come out dark and light ones light, so a grey ship and a tile still tell
// the plate shades apart.
function toneAt(stage: Stage, tone: ImageData | null, at: number) {
  if (!tone || !stage.textureU[at]) {
    return 1;
  }
  const column = Math.floor(((stage.textureU[at] - 1) * tone.width) / 254);
  const line = Math.floor((stage.textureV[at] * tone.height) / 65536);
  const from = (line * tone.width + column) * 4;
  const [red, green, blue] = tone.data.subarray(from, from + 3);
  const light = (0.3 * red + 0.59 * green + 0.11 * blue) / 255;
  return TILE_FLOOR + (1 - TILE_FLOOR) * light;
}

function paint(
  canvas: HTMLCanvasElement,
  stage: Stage,
  lit: Set<number>,
  hover: number,
  texture: ImageData | null,
  tone: ImageData | null,
) {
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }
  const { shade, group, textureU, textureV, width, height } = stage;
  const image = context.createImageData(width, height);
  for (let at = 0; at < shade.length; at += 1) {
    const owner = group[at];
    if (owner === HIDDEN) {
      continue;
    }
    const value = shade[at];
    // The open groups, or the one under the pointer, light up: the other picked
    // groups stay grey. Parts every ship carries belong to no group and never
    // light up.
    const bright = owner >= 0 && (lit.has(owner) || owner === hover);
    const to = at * 4;
    if (texture) {
      const light = ((bright ? 1.25 : 1) * value) / 255;
      const column = Math.floor(((textureU[at] - 1) * texture.width) / 254);
      const row = Math.floor((textureV[at] * texture.height) / 65536);
      const from = (row * texture.width + column) * 4;
      for (let channel = 0; channel < 3; channel += 1) {
        const lightless = textureU[at] ? texture.data[from + channel] : LENS;
        image.data[to + channel] = Math.min(255, lightless * light);
      }
    } else {
      const grey = value * toneAt(stage, tone, at);
      image.data[to] = grey * (bright ? 1 : 0.72);
      image.data[to + 1] = grey * (bright ? 0.62 : 0.76);
      image.data[to + 2] = grey * (bright ? 0.36 : 0.82);
    }
    image.data[to + 3] = 255;
  }
  context.putImageData(image, 0, 0);
}

function Ship(props: {
  parts: Parts;
  choice: PartChoice;
  active: string;
  painted: Painted | null;
  onSelect: (group: string) => void;
}) {
  const { parts, choice, active, painted, onSelect } = props;
  const canvas = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState<Stage | null>(null);
  const [hover, setHover] = useState(NOT_A_GROUP);
  const [texture, setTexture] = useState<ImageData | null>(null);
  const [tone, setTone] = useState<ImageData | null>(null);
  const activeIndex = PART_GROUPS.findIndex((row) => row.id === active);
  // The last paint stays until the next one is made.
  const shown = painted === null ? null : texture;
  // The open group lights up; where it draws nothing of its own on this ship, as
  // the Plated upper wings of a Pod, whose wings belong to the group under it,
  // the groups that hang on it light up instead.
  const lit = useMemo(() => {
    if (!stage || stage.group.includes(activeIndex)) {
      return new Set([activeIndex]);
    }
    return branchOf(PART_GROUPS[activeIndex]);
  }, [stage, activeIndex]);

  useEffect(() => {
    void paintTexture(TONE)
      .then(setTone)
      .catch(() => {
        // Without it the grey ship shows no plate shades.
      });
  }, []);

  useEffect(() => {
    let current = true;
    void buildStage(parts, layersOf(parts.tree, choice))
      .then((built) => {
        if (current) {
          setStage(built);
        }
      })
      .catch(() => {
        // The last whole picture stays until the next pick asks again.
      });
    return () => {
      current = false;
    };
  }, [parts, choice]);

  useEffect(() => {
    if (painted === null) {
      return;
    }
    let current = true;
    void paintTexture(painted)
      .then((image) => {
        if (current) {
          setTexture(image);
        }
      })
      .catch(() => {
        // The ship stays grey until the next pick asks again.
      });
    return () => {
      current = false;
    };
  }, [painted]);

  useEffect(() => {
    if (canvas.current && stage) {
      paint(canvas.current, stage, lit, hover, shown, tone);
    }
  }, [stage, lit, hover, shown, tone]);

  const groupAt = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!stage) {
      return NOT_A_GROUP;
    }
    const box = event.currentTarget.getBoundingClientRect();
    const x = Math.floor(
      ((event.clientX - box.left) / box.width) * stage.width,
    );
    const y = Math.floor(
      ((event.clientY - box.top) / box.height) * stage.height,
    );
    return stage.group[y * stage.width + x] ?? NOT_A_GROUP;
  };

  return (
    <Box
      component="canvas"
      ref={canvas}
      width={parts.width}
      height={parts.height}
      aria-label="A No Man's Sky Interceptor, built from the parts you pick"
      onClick={(event: React.MouseEvent<HTMLCanvasElement>) => {
        const group = groupAt(event);
        if (group >= 0) {
          onSelect(PART_GROUPS[group].id);
        }
      }}
      onMouseMove={(event: React.MouseEvent<HTMLCanvasElement>) => {
        setHover(Math.max(groupAt(event), NOT_A_GROUP));
      }}
      onMouseLeave={() => setHover(NOT_A_GROUP)}
      sx={{
        display: "block",
        width: "100%",
        height: "auto",
        cursor: hover >= 0 ? "pointer" : "default",
      }}
    />
  );
}

// How dark a black band leaves a tile, against a white one.
const TILE_FLOOR = 0.35;

// A part alone, cut to what it covers.
function Thumb(props: { parts: Parts; group: PartGroup; option: string }) {
  const { parts, group: row, option } = props;
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let current = true;
    void Promise.all([
      buildStage(parts, optionLayers(parts, row, option)),
      paintTexture(TONE).catch(() => null),
    ]).then(([stage, texture]) => {
      const context = canvas.current?.getContext("2d");
      if (!current || !context || !canvas.current) {
        return;
      }
      const { shade, group, width, height } = stage;
      const tone = (at: number) => toneAt(stage, texture, at);
      let [left, top, right, bottom] = [width, height, -1, -1];
      group.forEach((owner, at) => {
        if (owner !== HIDDEN) {
          const [x, y] = [at % width, Math.floor(at / width)];
          [left, top] = [Math.min(left, x), Math.min(top, y)];
          [right, bottom] = [Math.max(right, x), Math.max(bottom, y)];
        }
      });
      if (right < 0) {
        return;
      }
      const [across, down] = [right - left + 1, bottom - top + 1];
      canvas.current.width = across;
      canvas.current.height = down;
      const image = context.createImageData(across, down);
      for (let y = 0; y < down; y += 1) {
        for (let x = 0; x < across; x += 1) {
          const at = (top + y) * width + left + x;
          const to = (y * across + x) * 4;
          if (group[at] !== HIDDEN) {
            const value = shade[at] * tone(at);
            image.data[to] = value;
            image.data[to + 1] = value * 0.62;
            image.data[to + 2] = value * 0.36;
            image.data[to + 3] = 255;
          }
        }
      }
      context.putImageData(image, 0, 0);
    });
    return () => {
      current = false;
    };
  }, [parts, row, option]);

  return (
    <Box
      component="canvas"
      ref={canvas}
      width={0}
      height={0}
      aria-hidden
      sx={{ maxWidth: 116, maxHeight: 72 }}
    />
  );
}

function PartTiles(props: {
  parts: Parts | null;
  group: PartGroup;
  choice: PartChoice;
  title: string;
  onChange: (option: string) => void;
}) {
  const { parts, group, choice, title, onChange } = props;
  const value = choice[group.id];
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">{title}</Typography>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={value ?? null}
        // A click on the picked option leaves it: a list always holds a part.
        onChange={(_event, option: string | null) => {
          if (option !== null) {
            onChange(option);
          }
        }}
        aria-label={title}
        sx={{ flexWrap: "wrap", gap: 1 }}
      >
        {group.options.map((option) => (
          <ToggleButton key={option.id} value={option.id} sx={TILE}>
            <Box sx={{ height: 72, display: "flex", alignItems: "center" }}>
              {parts && !option.empty ? (
                <Thumb parts={parts} group={group} option={option.id} />
              ) : null}
            </Box>
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Stack>
  );
}

// The game's palette has eight rows of eight colours.
const ROW = 8;

// Where a band takes a colour the player has not picked yet: the first colour of
// each row of the palette.
const ANY_COLOUR = `linear-gradient(90deg, ${PAINT.filter((_, cell) => cell % ROW === 0).join(", ")})`;

// The two bands as they stand on the ship: the hull above the trim.
function Bands(props: { bands: [string | null, string | null] }) {
  const { bands } = props;
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: 24,
        borderRadius: 0.5,
        overflow: "hidden",
        border: "1px solid #c4c7cc",
      }}
    >
      {bands.map((colour, at) => (
        <Box key={at} sx={{ flex: 1, background: colour ?? ANY_COLOUR }} />
      ))}
    </Box>
  );
}

const SWATCH = {
  ...TILE,
  width: "auto",
  minWidth: 0,
  px: 0.5,
  fontSize: "0.7rem",
  lineHeight: 1.2,
  textTransform: "none",
};

// One swatch of the colour grid, in px, on a phone and wider.
const SWATCH_SIZE = { xs: 28, sm: 32 };

// Every colour the game paints a band with, as the game holds them: eight rows of
// eight, a few colours twice.
function PaintTiles(props: {
  label: ReactNode;
  value: number | null;
  onChange: (cell: number | null) => void;
}) {
  const { label, value, onChange } = props;
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">{label}</Typography>
      <Box
        role="radiogroup"
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${ROW}, max-content)`,
          gap: { xs: 0.5, sm: 0.75 },
        }}
      >
        {PAINT.map((hex, cell) => (
          <Box
            key={cell}
            component="button"
            type="button"
            role="radio"
            aria-checked={cell === value}
            aria-label={hex}
            title={hex}
            onClick={() => onChange(cell === value ? null : cell)}
            sx={{
              width: SWATCH_SIZE,
              height: SWATCH_SIZE,
              p: 0,
              cursor: "pointer",
              borderRadius: 0.5,
              bgcolor: hex,
              border: "1px solid #c4c7cc",
              outline: cell === value ? `3px solid ${MARK}` : "none",
              outlineOffset: 1,
            }}
          />
        ))}
      </Box>
    </Stack>
  );
}

// The colour: a scheme of the two bands, then a colour of the game for each band it
// leaves open. Every form comes in every colour.
function ColourTiles(props: {
  paint: Paint;
  onChange: (paint: Paint) => void;
}) {
  const { paint, onChange } = props;
  const scheme = paint.scheme === null ? null : SCHEMES[paint.scheme];
  return (
    <Stack spacing={2}>
      <Stack spacing={1}>
        <Typography variant="subtitle2">
          <FormattedMessage id="archive.finderColour" />
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={paint.scheme}
          onChange={(_event, value: number | null) => {
            if (value === null) {
              onChange(NO_PAINT);
              return;
            }
            // A colour stays when the new scheme still uses its band.
            const keep = (band: "hull" | "trim") =>
              SCHEMES[value][band] ? paint[band] : null;
            onChange({ scheme: value, hull: keep("hull"), trim: keep("trim") });
          }}
          aria-label="Colour scheme"
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: `repeat(${SCHEMES.length}, 1fr)`,
            },
            gap: 0.5,
          }}
        >
          {SCHEMES.map((row, index) => (
            <ToggleButton key={row.id} value={index} sx={SWATCH}>
              <Bands
                bands={bandsOf({
                  scheme: index,
                  hull: index === paint.scheme ? paint.hull : null,
                  trim: index === paint.scheme ? paint.trim : null,
                })}
              />
              {row.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>
      {scheme?.hull ? (
        <PaintTiles
          label={<FormattedMessage id="archive.finderHull" />}
          value={paint.hull}
          onChange={(cell) => onChange({ ...paint, hull: cell })}
        />
      ) : null}
      {scheme?.trim ? (
        <PaintTiles
          label={<FormattedMessage id="archive.finderTrim" />}
          value={paint.trim}
          onChange={(cell) => onChange({ ...paint, trim: cell })}
        />
      ) : null}
      {scheme?.hull || scheme?.trim ? (
        <Typography variant="caption">
          <FormattedMessage id="archive.finderPalette" />
        </Typography>
      ) : null}
    </Stack>
  );
}

// One row of portal glyphs across the width it is given, whatever that is, and
// a note under it: by default, why the system holds no class S wreck.
export function Answer(props: { code: string; note?: ReactNode }) {
  const { code, note } = props;
  return (
    // Wider than the article column: the row runs almost across the page.
    <Box
      sx={{
        containerType: "inline-size",
        width: "min(calc(100vw - 48px), 1152px)",
        position: "relative",
        left: "50%",
        transform: "translateX(-50%)",
      }}
    >
      <Box
        aria-label={code}
        sx={{
          fontFamily: "var(--font-glyphs)",
          fontSize: `calc(100cqw / ${code.length * GLYPH_WIDTH})`,
          lineHeight: 1.1,
          whiteSpace: "nowrap",
          textAlign: "center",
        }}
      >
        {code}
      </Box>
      <Typography variant="body2" sx={{ textAlign: "center", mt: 1 }}>
        {note ?? (
          <FormattedMessage
            id="archive.finderNoS"
            values={{
              a: (chunks) => (
                <MuiLink component={Link} href={guidePath("economy")}>
                  {chunks}
                </MuiLink>
              ),
            }}
          />
        )}
      </Typography>
    </Box>
  );
}

// One Tap on the click, and a Google button beside it for when One Tap refuses.
export function SignIn() {
  const { promptSignIn, renderSignIn } = useAuth();
  const button = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (button.current) {
      void renderSignIn(button.current);
    }
    void promptSignIn();
  }, [promptSignIn, renderSignIn]);

  return (
    <Stack spacing={1} sx={{ alignItems: "flex-start" }}>
      <Alert severity="info" sx={{ alignSelf: "stretch" }}>
        <FormattedMessage id="archive.finderSignIn" />
      </Alert>
      <div ref={button} />
    </Stack>
  );
}

type BuilderValues = { choice: PartChoice; paint: Paint };

// The builder is a form of two values, the parts and the paint; it is never
// sent: every pick is a ship that exists.
function Builder() {
  const [parts, setParts] = useState<Parts | null>(null);
  const { control } = useForm<BuilderValues>({
    defaultValues: { choice: START, paint: NO_PAINT },
  });
  const choice = useWatch({ control, name: "choice" });
  const paint = useWatch({ control, name: "paint" });
  const painted = useMemo(() => paintedOf(paint), [paint]);
  const [active, setActive] = useState(PART_GROUPS[0].id);
  const fits = useMemo(
    () => PART_GROUPS.filter((row) => choice[row.id] !== undefined),
    [choice],
  );
  const names = useMemo(() => chipNames(fits), [fits]);
  const picked = PART_GROUPS.find((row) => row.id === active) ?? PART_GROUPS[0];
  // A group that no longer applies hands over to the one of its title that does.
  const group = fits.includes(picked)
    ? picked
    : (fits.find((row) => row.title === picked.title) ?? fits[0]);

  useEffect(() => {
    void fetch(`${LAYERS}/parts.json`)
      .then((response) => response.json())
      .then((value: Parts) => setParts(value));
  }, []);

  return (
    <Card variant="outlined" sx={{ p: 2, bgcolor: SURFACE, color: INK }}>
      <Stack
        component="form"
        noValidate
        spacing={2}
        onSubmit={(event) => event.preventDefault()}
      >
        <Box sx={{ minHeight: 200 }}>
          {parts ? (
            <Ship
              parts={parts}
              choice={choice}
              active={group.id}
              painted={painted}
              onSelect={setActive}
            />
          ) : null}
        </Box>
        <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
          {fits.map((row) => (
            <Chip
              key={row.id}
              label={names.get(row.id)}
              clickable
              color={row.id === group.id ? "primary" : "default"}
              variant={
                optionOf(row, choice[row.id])?.empty ? "outlined" : "filled"
              }
              onClick={() => setActive(row.id)}
            />
          ))}
        </Stack>
        <Controller
          name="choice"
          control={control}
          render={({ field }) => (
            <PartTiles
              parts={parts}
              group={group}
              choice={field.value}
              title={names.get(group.id) ?? group.title}
              onChange={(option) =>
                field.onChange(pick(field.value, group, option))
              }
            />
          )}
        />
        <Controller
          name="paint"
          control={control}
          render={({ field }) => (
            <ColourTiles paint={field.value} onChange={field.onChange} />
          )}
        />
      </Stack>
    </Card>
  );
}

export function InterceptorFinder(props: { html: string }) {
  return <Article html={props.html} widgets={{ finder: Builder }} />;
}
