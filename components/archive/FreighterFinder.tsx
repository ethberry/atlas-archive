"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { FormattedMessage } from "react-intl";

import { Article } from "@/components/archive/Article";
import { Answer, SignIn } from "@/components/archive/InterceptorFinder";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  FREIGHTER_KINDS,
  applies,
  freighterForm,
  freighterKey,
  freighterOption,
  settledFreighter,
  type FreighterGroup,
  type FreighterKind,
} from "@/lib/archive/freighter-parts";
import type { PartChoice } from "@/lib/archive/interceptor-parts";

type TreePart = { name: string; layer: string; groups: TreePart[][] };

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
  | { status: "done"; reply: Reply }
  // The answer of a kind with no search, the same for every shape.
  | { status: "anywhere" };

// The stage: the shade of each pixel and the form group that stands there.
type Stage = {
  shade: Uint8Array;
  group: Int8Array;
  width: number;
  height: number;
};

// What each kind's page says. A kind with `anywhere` has no search: its button
// needs no sign-in and gives that answer.
const TEXT: Record<
  FreighterKind,
  { note: string; button: string; anywhere?: string; ship: string }
> = {
  capital: {
    note: "archive.freighterClass",
    button: "archive.finderSearch",
    ship: "A No Man's Sky freighter, built from the parts you pick",
  },
  regular: {
    note: "archive.regularFreighterClass",
    button: "archive.freighterWhere",
    anywhere: "archive.regularFreighterAnywhere",
    ship: "A No Man's Sky freighter, built from the parts you pick",
  },
  living: {
    note: "archive.livingShipClass",
    button: "archive.freighterWhere",
    anywhere: "archive.livingShipWhere",
    ship: "A No Man's Sky living ship, built from the parts you pick",
  },
};
// The calm surface of the Interceptor finder.
const SURFACE = "#e7e8ea";
const INK = "#1d2026";
const MARK = "#c8561b";
const TILE = {
  flexDirection: "column",
  gap: 0.5,
  width: 132,
  bgcolor: "#f4f4f5",
  color: INK,
  textTransform: "none",
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

// The picks after `option` is set in `group`: what it needs comes in, all the way
// up, and what no longer applies goes out.
function pick(
  kind: FreighterKind,
  choice: PartChoice,
  group: FreighterGroup,
  option: string | null,
) {
  const { groups } = FREIGHTER_KINDS[kind];
  const next = { ...choice };
  if (option === null) {
    delete next[group.id];
  } else {
    next[group.id] = option;
    let needs = group.requires;
    while (needs) {
      next[needs.group] = needs.option;
      const above = needs.group;
      needs = groups.find((row) => row.id === above)?.requires;
    }
  }
  return settledFreighter(kind, next);
}

// The form groups of each part name: the groups that own a part's picture, then
// the groups whose options name it. A name can stand in two groups, such as the
// tower head of either regular hull, or the end of a box's last section, which
// the tail names and the length owns.
function groupsOf(groups: FreighterGroup[]) {
  const out = new Map<string, number[]>();
  const add = (name: string, index: number) =>
    out.set(name, [...(out.get(name) ?? []), index]);
  groups.forEach((group, index) => {
    for (const name of group.owns ?? []) {
      add(name, index);
    }
  });
  groups.forEach((group, index) => {
    for (const option of group.options) {
      for (const name of option.names) {
        add(name, index);
      }
    }
  });
  return out;
}

const subtrees = new WeakMap<TreePart, Set<string>>();

// Every part name at and under `part`.
function namesUnder(part: TreePart) {
  let names = subtrees.get(part);
  if (!names) {
    names = new Set([part.name]);
    for (const group of part.groups) {
      for (const row of group) {
        for (const name of namesUnder(row)) {
          names.add(name);
        }
      }
    }
    subtrees.set(part, names);
  }
  return names;
}

// What stands in for a group nobody picked: the part of a "none" option where
// the page offers one (`blanks`), so a fin, a mast or an end plate shows only when
// picked; else the first part that shows anything.
function standIn(group: TreePart[], blanks: Set<string>) {
  return (
    group.find((part) => blanks.has(part.name)) ??
    group.find((part) => !/null|none/i.test(part.name)) ??
    group[0]
  );
}

// The layers of a ship with these picks, each with its form group. In each group
// of the tree the part under which the most picks are met wins: a bridge picked
// with a length of four sections takes the spine down to its fourth section.
// `anchors`, when given, gets each layer's nearest group above it that is not a
// `first` group, so a tile can draw the containers of the sections it shows.
function layersOf(
  kind: FreighterKind,
  tree: TreePart[][],
  choice: PartChoice,
  anchors?: Map<string, number>,
) {
  const { groups } = FREIGHTER_KINDS[kind];
  const owners = groupsOf(groups);
  const wanted = new Map<string, number[]>();
  // A group whose parts stand at every place, such as the containers of each
  // cargo section, picks its part where it stands and pulls the walk nowhere.
  const spread = new Set<string>();
  // The parts of such groups, owned ones too: a tree group made only of them is
  // a choice of containers, where a part with the pick one level under it (the
  // frame that holds the spheres of a spine) is the pick too.
  const spreading = new Set<string>();
  groups.forEach((group, index) => {
    if (group.first) {
      for (const name of [
        ...(group.owns ?? []),
        ...group.options.flatMap((option) => option.names),
      ]) {
        spreading.add(name);
      }
    }
    for (const name of freighterOption(group, choice[group.id])?.names ?? []) {
      if (group.first) {
        spread.add(name);
      } else {
        wanted.set(name, [...(wanted.get(name) ?? []), index]);
      }
    }
  });
  const blanks = new Set(
    groups.flatMap((group) =>
      group.options
        .filter((option) => option.id === "none")
        .flatMap((option) => option.names),
    ),
  );
  const spreads = (group: TreePart[]) =>
    group.find((row) => spread.has(row.name)) ??
    (group.every((row) => spreading.has(row.name))
      ? group.find((row) =>
          row.groups.some((kids) => kids.some((kid) => spread.has(kid.name))),
        )
      : undefined);
  const score = (part: TreePart) => {
    const met = new Set<number>();
    for (const name of namesUnder(part)) {
      for (const index of wanted.get(name) ?? []) {
        met.add(index);
      }
    }
    return met.size;
  };
  const out: [string, number][] = [["base", NOT_A_GROUP]];
  const walk = (rows: TreePart[][], owner: number, anchor: number) => {
    for (const group of rows) {
      let part = spreads(group) ?? standIn(group, blanks);
      let best = 0;
      for (const row of group) {
        const met = score(row);
        if (met > best) {
          [part, best] = [row, met];
        }
      }
      // A group that owns the part's picture and applies takes it, else the
      // last group that names the part and applies.
      const named = owners.get(part.name) ?? [];
      const here =
        named.find(
          (index) =>
            groups[index].owns?.includes(part.name) &&
            applies(groups[index], choice),
        ) ??
        named.findLast((index) => applies(groups[index], choice)) ??
        named.at(-1) ??
        owner;
      out.push([part.layer, here]);
      const below = groups[here]?.first ? anchor : here;
      anchors?.set(part.layer, below);
      walk(part.groups, here, below);
    }
  };
  walk(tree, NOT_A_GROUP, NOT_A_GROUP);
  return out;
}

const images = new Map<string, Promise<ImageData>>();

async function loadLayer(path: string, tries = 3): Promise<ImageData> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(path);
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
      return loadLayer(path, tries - 1);
    }
    throw error;
  }
}

// A load that fails leaves the cache, so the next picture asks again.
function layerImage(kind: FreighterKind, name: string) {
  const path = `${FREIGHTER_KINDS[kind].layers}/${encodeURIComponent(name)}.png`;
  let image = images.get(path);
  if (!image) {
    image = loadLayer(path).catch((error: unknown) => {
      images.delete(path);
      throw error;
    });
    images.set(path, image);
  }
  return image;
}

// What a tile shows: the layers of a ship with only this option picked, kept to
// this group and the groups that hang on it. A group that hangs on it and can
// show nothing, such as a fin, shows nothing, so the tile draws only what the
// option itself brings. Every other group that can be None is None where a form
// allows it, so a length ends in its own end section, not in a tail.
function optionLayers(
  kind: FreighterKind,
  tree: TreePart[][],
  group: FreighterGroup,
  option: string,
): [string, number][] {
  const { groups } = FREIGHTER_KINDS[kind];
  const choice = pick(kind, { ...group.tile }, group, option);
  const whole = freighterOption(group, option)?.whole;
  const shown = new Set<number>();
  groups.forEach((row, index) => {
    if (row.id === group.id) {
      shown.add(index);
    } else if (row.requires?.group === group.id) {
      shown.add(index);
      const blank = row.options.find(
        (entry) =>
          entry.id === "none" ||
          entry.names.every((name) => /null|none/i.test(name)),
      );
      if (!whole && blank && applies(row, choice)) {
        choice[row.id] = blank.id;
      }
    } else if (row.options.some((entry) => entry.id === "none")) {
      const plain = { ...choice, [row.id]: "none" };
      if (applies(row, choice) && freighterForm(kind, plain) >= 0) {
        choice[row.id] = "none";
      }
    }
  });
  // The containers of the sections the tile shows come with them: a spine's
  // section has no picture but its containers.
  const anchors = new Map<string, number>();
  return layersOf(kind, tree, choice, anchors)
    .filter(
      ([name, owner]) =>
        shown.has(owner) ||
        (groups[owner]?.first === true && shown.has(anchors.get(name) ?? -3)),
    )
    .map(([name]) => [name, NOT_A_GROUP]);
}

// Lays the layers over each other: the nearest pixel wins, as on the ship. Green
// and blue hold sixteen bits of depth.
async function buildStage(
  kind: FreighterKind,
  parts: Parts,
  layers: [string, number][],
): Promise<Stage> {
  const { width, height } = parts;
  const shade = new Uint8Array(width * height);
  const depth = new Uint16Array(width * height);
  const group = new Int8Array(width * height).fill(HIDDEN);
  const rows = layers.filter(([name]) => parts.layers[name]);
  const pictures = await Promise.all(
    rows.map(([name]) => layerImage(kind, name)),
  );
  rows.forEach(([name, owner], index) => {
    const [left, top, across, down] = parts.layers[name];
    const { data } = pictures[index];
    for (let y = 0; y < down; y += 1) {
      for (let x = 0; x < across; x += 1) {
        const from = (y * across + x) * 4;
        if (data[from + 3] === 0) {
          continue;
        }
        const to = (top + y) * width + left + x;
        const near = (data[from + 1] << 8) | data[from + 2];
        if (group[to] === HIDDEN || near >= depth[to]) {
          shade[to] = data[from];
          depth[to] = near;
          group[to] = owner;
        }
      }
    }
  });
  return { shade, group, width, height };
}

function paint(
  canvas: HTMLCanvasElement,
  stage: Stage,
  picked: boolean[],
  active: number,
  hover: number,
) {
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }
  const { shade, group, width, height } = stage;
  const image = context.createImageData(width, height);
  for (let at = 0; at < shade.length; at += 1) {
    const owner = group[at];
    if (owner === HIDDEN) {
      continue;
    }
    const value = shade[at];
    // Parts every ship carries belong to no group and never light up.
    const lit = owner >= 0 && (owner === active || owner === hover);
    const chosen = owner >= 0 && picked[owner];
    const to = at * 4;
    image.data[to] = value * (lit ? 1 : chosen ? 0.75 : 0.72);
    image.data[to + 1] = value * (lit ? 0.62 : chosen ? 0.45 : 0.76);
    image.data[to + 2] = value * (lit ? 0.36 : chosen ? 0.32 : 0.82);
    image.data[to + 3] = 255;
  }
  context.putImageData(image, 0, 0);
}

function Ship(props: {
  kind: FreighterKind;
  parts: Parts;
  choice: PartChoice;
  active: string;
  onSelect: (group: string) => void;
}) {
  const { kind, parts, choice, active, onSelect } = props;
  const { groups } = FREIGHTER_KINDS[kind];
  const canvas = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState<Stage | null>(null);
  const [hover, setHover] = useState(NOT_A_GROUP);
  const activeIndex = groups.findIndex((row) => row.id === active);

  useEffect(() => {
    let current = true;
    void buildStage(kind, parts, layersOf(kind, parts.tree, choice))
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
  }, [kind, parts, choice]);

  useEffect(() => {
    if (canvas.current && stage) {
      const picked = groups.map((row) => choice[row.id] !== undefined);
      paint(canvas.current, stage, picked, activeIndex, hover);
    }
  }, [stage, groups, choice, activeIndex, hover]);

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
      aria-label={TEXT[kind].ship}
      onClick={(event: React.MouseEvent<HTMLCanvasElement>) => {
        const group = groupAt(event);
        if (group >= 0) {
          onSelect(groups[group].id);
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

// A part alone, cut to what it covers.
function Thumb(props: {
  kind: FreighterKind;
  parts: Parts;
  group: FreighterGroup;
  option: string;
}) {
  const { kind, parts, group: row, option } = props;
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let current = true;
    void buildStage(
      kind,
      parts,
      optionLayers(kind, parts.tree, row, option),
    ).then((stage) => {
      const context = canvas.current?.getContext("2d");
      if (!current || !context || !canvas.current) {
        return;
      }
      const { shade, group, width, height } = stage;
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
            image.data[to] = shade[at];
            image.data[to + 1] = shade[at] * 0.62;
            image.data[to + 2] = shade[at] * 0.36;
            image.data[to + 3] = 255;
          }
        }
      }
      context.putImageData(image, 0, 0);
    });
    return () => {
      current = false;
    };
  }, [kind, parts, row, option]);

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
  kind: FreighterKind;
  parts: Parts | null;
  group: FreighterGroup;
  choice: PartChoice;
  onChange: (option: string | null) => void;
}) {
  const { kind, parts, group, choice, onChange } = props;
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
              freighterForm(kind, pick(kind, choice, group, option.id)) < 0
            }
            sx={TILE}
          >
            <Box sx={{ height: 72, display: "flex", alignItems: "center" }}>
              {option.swatch ? (
                <Box
                  aria-hidden
                  sx={{
                    width: 72,
                    height: 48,
                    borderRadius: 1,
                    bgcolor: option.swatch,
                    border: "1px solid #8c9096",
                  }}
                />
              ) : parts ? (
                <Thumb
                  kind={kind}
                  parts={parts}
                  group={group}
                  option={option.id}
                />
              ) : null}
            </Box>
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Stack>
  );
}

function Results(props: { kind: FreighterKind; state: State }) {
  const { kind, state } = props;
  const anywhere = TEXT[kind].anywhere;
  if (state.status === "anywhere" && anywhere) {
    return (
      <Alert severity="success">
        <FormattedMessage id={anywhere} />
      </Alert>
    );
  }
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
  return state.status === "done" ? (
    <Answer
      code={state.reply.found}
      note={<FormattedMessage id="archive.freighterAnswer" />}
    />
  ) : null;
}

function Finder(props: { kind: FreighterKind }) {
  const { kind } = props;
  const { user } = useAuth();
  const [here, setHere] = useState<Parts | null>(null);
  const [choice, setChoice] = useState<PartChoice>({});
  const { groups } = FREIGHTER_KINDS[kind];
  const [active, setActive] = useState(groups[0].id);
  const [state, setState] = useState<State>({ status: "idle" });
  // Once signed in, the picks stand and the button works.
  const shown: State =
    user && state.status === "signIn" ? { status: "idle" } : state;
  const group = groups.find((row) => row.id === active) ?? groups[0];
  const key = freighterKey(choice);
  // The groups that apply to the picks so far, and the one the ship was clicked on.
  const open = useMemo(
    () => groups.filter((row) => applies(row, choice) || row.id === active),
    [groups, choice, active],
  );

  useEffect(() => {
    void fetch(`${FREIGHTER_KINDS[kind].layers}/parts.json`)
      .then((response) => response.json())
      .then((value: Parts) => setHere(value));
  }, [kind]);

  const search = useCallback(async () => {
    if (TEXT[kind].anywhere) {
      setState({ status: "anywhere" });
      return;
    }
    if (!user) {
      setState({ status: "signIn" });
      return;
    }
    setState({ status: "busy" });
    const response = await fetch(
      `/api/freighter-finder?kind=${kind}&parts=${encodeURIComponent(key)}`,
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
  }, [key, kind, user]);

  return (
    <Card variant="outlined" sx={{ p: 2, bgcolor: SURFACE, color: INK }}>
      <Stack spacing={2}>
        {kind === "capital" ? (
          <Alert severity="info">
            <FormattedMessage id="archive.finderOneADay" />
          </Alert>
        ) : null}
        <Alert severity="info">
          <FormattedMessage id={TEXT[kind].note} />
        </Alert>
        <Box sx={{ minHeight: 160 }}>
          {here ? (
            <Ship
              kind={kind}
              parts={here}
              choice={choice}
              active={active}
              onSelect={setActive}
            />
          ) : null}
        </Box>
        <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
          {open.map((row) => (
            <Chip
              key={row.id}
              label={row.title}
              clickable
              color={row.id === active ? "primary" : "default"}
              variant={choice[row.id] ? "filled" : "outlined"}
              onClick={() => setActive(row.id)}
            />
          ))}
        </Stack>
        <PartTiles
          key={group.id}
          kind={kind}
          parts={here}
          group={group}
          choice={choice}
          onChange={(option) => {
            setChoice(pick(kind, choice, group, option));
            setState({ status: "idle" });
          }}
        />
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            disabled={state.status === "busy"}
            onClick={search}
          >
            <FormattedMessage id={TEXT[kind].button} />
          </Button>
          <Button
            disabled={key === ""}
            onClick={() => {
              setChoice({});
              setState({ status: "idle" });
            }}
          >
            <FormattedMessage id="archive.finderClear" />
          </Button>
        </Stack>
        <Results kind={kind} state={shown} />
      </Stack>
    </Card>
  );
}

// One page a kind: /capital-freighter-finder, /freighter-finder, and
// /living-ship-finder.
export function FreighterFinder(props: { html: string; kind: FreighterKind }) {
  const { html, kind } = props;
  const widgets = useMemo(
    () => ({ finder: () => <Finder kind={kind} /> }),
    [kind],
  );
  return <Article html={html} widgets={widgets} />;
}
