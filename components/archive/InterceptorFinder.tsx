"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
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
  FAMILIES,
  NO_PAINT,
  PART_GROUPS,
  SCHEMES,
  bandsOf,
  choiceExists,
  choiceKey,
  lookOf,
  looksOf,
  optionOf,
  settled,
  type Paint,
  type PartChoice,
  type PartGroup,
} from "@/lib/archive/interceptor-parts";

type TreePart = { name: string; groups: TreePart[][] };

type Parts = {
  width: number;
  height: number;
  layers: Record<string, [number, number, number, number]>;
  tree: TreePart[][];
};

type Reply = { found: string };

type State =
  | { status: "idle" }
  | { status: "busy" }
  | { status: "signIn" }
  | { status: "failed"; limited: boolean }
  | { status: "done"; reply: Reply };

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
const HIDDEN = -2;

// The picks after `option` is set in `group`: what it needs comes in, and what
// no longer fits goes out, down to the empty option where a group has one.
function pick(
  choice: PartChoice,
  group: PartGroup,
  option: string | null,
  looks: number[] | null,
) {
  const next = { ...choice };
  if (option === null) {
    delete next[group.id];
  } else {
    next[group.id] = option;
    // What it needs, and what that needs in turn: Upper wings of a Pod need the
    // Pod, and the Pod needs the Carriage wing set.
    for (
      let needs = group.requires;
      needs;
      needs = PART_GROUPS.find((row) => row.id === needs?.group)?.requires
    ) {
      next[needs.group] = needs.option;
    }
  }
  const fits = settled(next);
  for (const row of PART_GROUPS) {
    if (choiceExists(fits, looks)) {
      break;
    }
    const empty = row.options.find((part) => part.empty);
    if (empty && row.id !== group.id && fits[row.id]) {
      fits[row.id] = empty.id;
    }
  }
  return fits;
}

const START = settled({});

// A set of parts with all its own parts empty looks like every other set, so the
// first of them starts on its first real variant. The player can still empty it.
function opened(choice: PartChoice, group: PartGroup, looks: number[] | null) {
  for (const row of PART_GROUPS) {
    if (row.requires?.group !== group.id) {
      continue;
    }
    const empty = row.options.find((option) => option.empty);
    if (
      row.requires.option !== choice[group.id] ||
      choice[row.id] !== empty?.id
    ) {
      continue;
    }
    const first = row.options.find(
      (option) =>
        !option.empty &&
        choiceExists({ ...choice, [row.id]: option.id }, looks),
    );
    return first ? { ...choice, [row.id]: first.id } : choice;
  }
  return choice;
}

// The form group of each part name.
const GROUP_OF = new Map(
  PART_GROUPS.flatMap((group, index) =>
    group.options.flatMap((option) =>
      option.names.map((name) => [name, index] as const),
    ),
  ),
);

// One chip a title: each hull has its own Skirting, and the one that fits the
// picks stands for both.
function chipsOf(fits: PartGroup[]) {
  return PART_GROUPS.filter((row) => {
    const twins = PART_GROUPS.filter((other) => other.title === row.title);
    const fitting = twins.find((other) => fits.includes(other));
    return (fitting ?? twins[0]) === row;
  });
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

// The part `name` with what stands on it: its children, as the ship shows them.
// The sets of wings: their tiles show the set, not what hangs on it.
const WING_SETS = new Set(["wings", "carriage"]);

// What a tile shows: the layers of a ship with only this option picked, as the
// ship would build it, kept to this group and the groups that hang on it. A set
// of wings shows its own mesh alone: its child groups have tiles of their own,
// and drawn here they made Stacked and Pod look like Rings, whose rails
// (`_WingsO_oFlip`, `_NWTop_Flip`) belong to the Rings option alone. A set with
// no mesh of its own (Stacked, Spread) shows each child group on its first real
// option other than Rings.
function optionLayers(
  parts: Parts,
  group: PartGroup,
  option: string,
): [string, number][] {
  const own = PART_GROUPS.indexOf(group);
  const base = pick(START, group, option, null);
  if (!WING_SETS.has(group.id)) {
    const choice = opened(base, group, null);
    const shown = new Set(
      PART_GROUPS.flatMap((row, index) =>
        index === own || row.requires?.group === group.id ? [index] : [],
      ),
    );
    return layersOf(parts.tree, choice)
      .filter(([, owner]) => shown.has(owner))
      .map(([name]) => [name, NOT_A_GROUP]);
  }
  const frame = layersOf(parts.tree, base).filter(
    ([name, owner]) => owner === own && parts.layers[name],
  );
  if (frame.length) {
    return frame.map(([name]) => [name, NOT_A_GROUP]);
  }
  const children = PART_GROUPS.flatMap((row, index) =>
    row.requires?.group === group.id && row.requires.option === option
      ? [index]
      : [],
  );
  const choice = { ...base };
  for (const index of children) {
    const row = PART_GROUPS[index];
    const first = row.options.find(
      (item) =>
        !item.empty &&
        item.id !== "rings" &&
        choiceExists({ ...choice, [row.id]: item.id }, null),
    );
    if (first) {
      choice[row.id] = first.id;
    }
  }
  const shown = new Set([own, ...children]);
  return layersOf(parts.tree, choice)
    .filter(([, owner]) => shown.has(owner))
    .map(([name]) => [name, NOT_A_GROUP]);
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

const looks = new Map<number, Promise<ImageData>>();

function lookTexture(look: number) {
  let image = looks.get(look);
  if (!image) {
    image = (async () => {
      const response = await fetch(`${LAYERS}/look-${look}.jpg`);
      const bitmap = await createImageBitmap(await response.blob(), {
        colorSpaceConversion: "none",
      });
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        throw new Error("No canvas.");
      }
      context.drawImage(bitmap, 0, 0);
      return context.getImageData(0, 0, bitmap.width, bitmap.height);
    })().catch((error: unknown) => {
      looks.delete(look);
      throw error;
    });
    looks.set(look, image);
  }
  return image;
}

function paint(
  canvas: HTMLCanvasElement,
  stage: Stage,
  active: number,
  hover: number,
  texture: ImageData | null,
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
    // Only the open group, or the one under the pointer, lights up: the other
    // picked groups stay grey, so a set never seems to own its children's wings.
    // Parts every ship carries belong to no group and never light up.
    const lit = owner >= 0 && (owner === active || owner === hover);
    const to = at * 4;
    if (texture) {
      const light = ((lit ? 1.25 : 1) * value) / 255;
      const column = Math.floor(((textureU[at] - 1) * texture.width) / 254);
      const row = Math.floor((textureV[at] * texture.height) / 65536);
      const from = (row * texture.width + column) * 4;
      for (let channel = 0; channel < 3; channel += 1) {
        const lightless = textureU[at] ? texture.data[from + channel] : LENS;
        image.data[to + channel] = Math.min(255, lightless * light);
      }
    } else {
      image.data[to] = value * (lit ? 1 : 0.72);
      image.data[to + 1] = value * (lit ? 0.62 : 0.76);
      image.data[to + 2] = value * (lit ? 0.36 : 0.82);
    }
    image.data[to + 3] = 255;
  }
  context.putImageData(image, 0, 0);
}

function Ship(props: {
  parts: Parts;
  choice: PartChoice;
  active: string;
  look: number | null;
  onSelect: (group: string) => void;
}) {
  const { parts, choice, active, look, onSelect } = props;
  const canvas = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState<Stage | null>(null);
  const [hover, setHover] = useState(NOT_A_GROUP);
  const [texture, setTexture] = useState<[number, ImageData] | null>(null);
  const activeIndex = PART_GROUPS.findIndex((row) => row.id === active);
  // The last look stays until the next one has loaded.
  const shown = look === null ? null : (texture?.[1] ?? null);

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
    if (look === null) {
      return;
    }
    let current = true;
    void lookTexture(look)
      .then((image) => {
        if (current) {
          setTexture([look, image]);
        }
      })
      .catch(() => {
        // The ship stays grey until the next pick asks again.
      });
    return () => {
      current = false;
    };
  }, [look]);

  useEffect(() => {
    if (canvas.current && stage) {
      paint(canvas.current, stage, activeIndex, hover, shown);
    }
  }, [stage, activeIndex, hover, shown]);

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

// The look whose texture darkens a tile where the ship is black: White, so black
// and light plates of one shape tell apart.
const TILE_LOOK = 1;
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
      lookTexture(TILE_LOOK).catch(() => null),
    ]).then(([stage, texture]) => {
      const context = canvas.current?.getContext("2d");
      if (!current || !context || !canvas.current) {
        return;
      }
      const { shade, group, textureU, textureV, width, height } = stage;
      // The light of the texture at `at`, 1 where it reads none.
      const tone = (at: number) => {
        if (!texture || !textureU[at]) {
          return 1;
        }
        const column = Math.floor(((textureU[at] - 1) * texture.width) / 254);
        const line = Math.floor((textureV[at] * texture.height) / 65536);
        const from = (line * texture.width + column) * 4;
        const [red, green, blue] = texture.data.subarray(from, from + 3);
        const light = (0.3 * red + 0.59 * green + 0.11 * blue) / 255;
        return TILE_FLOOR + (1 - TILE_FLOOR) * light;
      };
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
  looks: number[] | null;
  onChange: (option: string | null) => void;
}) {
  const { parts, group, choice, looks, onChange } = props;
  const value = choice[group.id];
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">{group.title}</Typography>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={value ?? null}
        onChange={(_event, option: string | null) => onChange(option)}
        aria-label={group.title}
        sx={{ flexWrap: "wrap", gap: 1 }}
      >
        {group.options.map((option) => (
          <ToggleButton
            key={option.id}
            value={option.id}
            disabled={
              option.id !== value &&
              !choiceExists(pick(choice, group, option.id, looks), looks)
            }
            sx={TILE}
          >
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

// Where a band takes a colour the player has not picked yet: every family.
const ANY_COLOUR = `linear-gradient(90deg, ${FAMILIES.map((row) => row.colour).join(", ")})`;

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

// A row of colour families for one band.
function FamilyTiles(props: {
  label: ReactNode;
  value: number | null;
  exists: (family: number) => boolean;
  onChange: (family: number | null) => void;
}) {
  const { label, value, exists, onChange } = props;
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">{label}</Typography>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={value}
        onChange={(_event, family: number | null) => onChange(family)}
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(3, 1fr)",
            sm: `repeat(${FAMILIES.length}, 1fr)`,
          },
          gap: 0.5,
        }}
      >
        {FAMILIES.map((row, index) => (
          <ToggleButton
            key={row.label}
            value={index}
            disabled={index !== value && !exists(index)}
            sx={SWATCH}
          >
            <Box
              sx={{
                width: "100%",
                height: 18,
                borderRadius: 0.5,
                bgcolor: row.colour,
              }}
            />
            {row.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Stack>
  );
}

// The colour: a scheme of the two bands, then a family for each band it leaves open.
function ColourTiles(props: {
  choice: PartChoice;
  paint: Paint;
  onChange: (paint: Paint) => void;
}) {
  const { choice, paint, onChange } = props;
  const scheme = paint.scheme === null ? null : SCHEMES[paint.scheme];
  const exists = (next: Paint) => choiceExists(choice, looksOf(next));
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
            // A family stays when the new scheme still uses its band and a ship
            // holds it.
            const keep = (band: "hull" | "trim") => {
              const family = SCHEMES[value][band] ? paint[band] : null;
              return family !== null &&
                exists({ ...NO_PAINT, scheme: value, [band]: family })
                ? family
                : null;
            };
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
            <ToggleButton
              key={row.id}
              value={index}
              disabled={
                index !== paint.scheme &&
                !exists({ ...NO_PAINT, scheme: index })
              }
              sx={SWATCH}
            >
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
        <FamilyTiles
          label={<FormattedMessage id="archive.finderHull" />}
          value={paint.hull}
          exists={(family) => exists({ ...paint, hull: family })}
          onChange={(family) => onChange({ ...paint, hull: family })}
        />
      ) : null}
      {scheme?.trim ? (
        <FamilyTiles
          label={<FormattedMessage id="archive.finderTrim" />}
          value={paint.trim}
          exists={(family) => exists({ ...paint, trim: family })}
          onChange={(family) => onChange({ ...paint, trim: family })}
        />
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
                <MuiLink component={Link} href="/guides/economy">
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

function Results(props: { state: State }) {
  const { state } = props;
  if (state.status === "signIn") {
    return <SignIn />;
  }
  if (state.status === "failed") {
    return (
      <Alert severity="warning">
        <FormattedMessage
          id={state.limited ? "archive.finderLimited" : "archive.finderFailed"}
        />
      </Alert>
    );
  }
  return state.status === "done" ? <Answer code={state.reply.found} /> : null;
}

function Finder() {
  const { user } = useAuth();
  const [parts, setParts] = useState<Parts | null>(null);
  const [choice, setChoice] = useState<PartChoice>(START);
  const [paint, setPaint] = useState<Paint>(NO_PAINT);
  // The looks the colour pick allows, or null for any.
  const looks = paint.scheme === null ? null : looksOf(paint);
  const look = lookOf(paint);
  const [active, setActive] = useState(PART_GROUPS[0].id);
  const [state, setState] = useState<State>({ status: "idle" });
  // Once signed in, the picks stand and the button works.
  const shown: State =
    user && state.status === "signIn" ? { status: "idle" } : state;
  const key = choiceKey(choice);
  const fits = useMemo(
    () =>
      PART_GROUPS.filter(
        (row) =>
          !row.requires || choice[row.requires.group] === row.requires.option,
      ),
    [choice],
  );
  const picked = PART_GROUPS.find((row) => row.id === active) ?? PART_GROUPS[0];
  // The Skirting of the other hull stands for the one picked before.
  const group = fits.includes(picked)
    ? picked
    : (fits.find((row) => row.title === picked.title) ?? picked);

  useEffect(() => {
    void fetch(`${LAYERS}/parts.json`)
      .then((response) => response.json())
      .then((value: Parts) => setParts(value));
  }, []);

  const search = useCallback(async () => {
    if (!user) {
      setState({ status: "signIn" });
      return;
    }
    setState({ status: "busy" });
    const response = await fetch(
      `/api/interceptor-finder?parts=${encodeURIComponent(key)}&look=${look}`,
    ).catch(() => null);
    if (response?.status === 401) {
      setState({ status: "signIn" });
      return;
    }
    if (!response?.ok) {
      setState({ status: "failed", limited: response?.status === 429 });
      return;
    }
    setState({ status: "done", reply: (await response.json()) as Reply });
  }, [key, look, user]);

  return (
    <Card variant="outlined" sx={{ p: 2, bgcolor: SURFACE, color: INK }}>
      <Stack spacing={2}>
        <Alert severity="info">
          <FormattedMessage id="archive.finderOneADay" />
        </Alert>
        <Alert severity="info">
          <FormattedMessage id="archive.finderNoClassS" />
        </Alert>
        <Box sx={{ minHeight: 200 }}>
          {parts ? (
            <Ship
              parts={parts}
              choice={choice}
              active={group.id}
              look={look}
              onSelect={setActive}
            />
          ) : null}
        </Box>
        <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
          {chipsOf(fits).map((row) => (
            <Chip
              key={row.id}
              label={row.title}
              clickable
              color={row.id === group.id ? "primary" : "default"}
              variant={choice[row.id] ? "filled" : "outlined"}
              disabled={!fits.includes(row) && row.id !== group.id}
              onClick={() => setActive(row.id)}
            />
          ))}
        </Stack>
        <PartTiles
          parts={parts}
          group={group}
          choice={choice}
          looks={looks}
          onChange={(option) => {
            setChoice(opened(pick(choice, group, option, looks), group, looks));
            setState({ status: "idle" });
          }}
        />
        <ColourTiles
          choice={choice}
          paint={paint}
          onChange={(value) => {
            setPaint(value);
            setState({ status: "idle" });
          }}
        />
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            disabled={state.status === "busy" || look === null}
            onClick={search}
          >
            <FormattedMessage id="archive.finderSearch" />
          </Button>
          <Button
            disabled={key === choiceKey(START) && paint.scheme === null}
            onClick={() => {
              setChoice(START);
              setPaint(NO_PAINT);
              setState({ status: "idle" });
            }}
          >
            <FormattedMessage id="archive.finderClear" />
          </Button>
        </Stack>
        <Results state={shown} />
      </Stack>
    </Card>
  );
}

export function InterceptorFinder(props: { html: string }) {
  return <Article html={props.html} widgets={{ finder: Finder }} />;
}
