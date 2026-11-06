// The game's own build, transferred: a ship is a tree of lists, every list holds
// exactly one part, and a held part opens its child lists (crimson-orb
// `procgen/src/descriptor.rs`, the port of `cTkResourceDescriptor::
// GenerateInstanceFromList`). The seed fills every list at once; the picture is the
// walk. The page keeps the same state, one part per list of the tree (`Assignment`),
// and derives everything from the walk: the picture, the chips, the option each
// group stands on, the tiles. A pick writes one list (and the path to it) and
// nothing else, so the parts of a branch the walk left keep their values and come
// back as they were (docs/ships/part-graph.md, Step 4, in crimson-orb).

import {
  firstOf,
  optionOf,
  type PartChoice,
  type PartGroup,
  type PartOption,
} from "./parts";
import type { ShipModule } from "./ship";

// A ship's `parts.json`: the size of the picture, where each layer stands on it,
// and the game's tree of parts, a list of lists. A part that stands in several
// places of a ship has a `layer` a place, named by the parts above it
// (`_Cap_2._CLarge_B`), and its groups name it by that layer; a tree without
// layers (the Interceptor's) names each part by its `name`.
export type TreePart = {
  name: string;
  layer?: string;
  groups: TreePart[][];
};

export type Parts = {
  width: number;
  height: number;
  layers: Record<string, [number, number, number, number]>;
  tree: TreePart[][];
};

// The owner of a layer that belongs to no group: `base` and the parts every ship
// carries.
export const NOT_A_GROUP = -1;

// The layer every ship has, under all others.
const BASE = "base";

// The suffix of a layer the art draws for one placement of a part the tree places
// several times on one layer (crimson-orb `ship_art/core.py`, `TWIN`).
const TWIN = "@1";

// One part per list of the tree, every list, always: what the game's walk gives a
// seed, and what the page holds.
export type Assignment = string[];

// What groups and layers call a part.
const keyOf = (part: TreePart) => part.layer ?? part.name;

type ListRow = {
  parts: TreePart[];
  // The list holding the part this list hangs under, and that part's key; the top
  // lists hang under nothing.
  parent: { list: number; part: string } | null;
};

// The tree of one ship, indexed once: its lists in walk order, each part's list
// and child lists, and the group of each part key.
export type TreeCore = {
  groups: PartGroup[];
  lists: ListRow[];
  listOf: Map<string, number>;
  partOf: Map<string, TreePart>;
  // The child lists of a part, by its key.
  under: Map<string, number[]>;
  // The group of a part key, by index into `groups`.
  groupOf: Map<string, number>;
  // The keys that draw: the layers of `parts.json`.
  draws: Set<string>;
  // Layers no group lights (`unlit` of the groups).
  unlit: Set<string>;
  // Echo layers (`echo` of the groups): shown only beside one of their recorders.
  echo: Map<string, string[]>;
  start: Assignment;
};

export function treeCore(parts: Parts, groups: PartGroup[]): TreeCore {
  const tree = parts.tree;
  const lists: ListRow[] = [];
  const listOf = new Map<string, number>();
  const partOf = new Map<string, TreePart>();
  const under = new Map<string, number[]>();
  const add = (rows: TreePart[][], parent: ListRow["parent"]) => {
    for (const parts of rows) {
      const at = lists.length;
      lists.push({ parts, parent });
      for (const part of parts) {
        const key = keyOf(part);
        // Two lists of one section can name the same part (`_Cargo_Top9` walks
        // two container descriptors whose parts share their names), and the art
        // draws them as one layer: the list whose part holds more is the one the
        // key belongs to, as the generator reads it (`search::pick::lists`).
        const held = partOf.get(key);
        if (held && (held.groups.length || !part.groups.length)) {
          continue;
        }
        listOf.set(key, at);
        partOf.set(key, part);
        under.set(key, []);
      }
      for (const part of parts) {
        const key = keyOf(part);
        const from = lists.length;
        add(part.groups, { list: at, part: key });
        under.set(
          key,
          Array.from(
            { length: lists.length - from },
            (_, i) => from + i,
          ).filter((row) => lists[row].parent?.part === key),
        );
      }
    }
  };
  add(tree, null);
  const groupOf = new Map<string, number>(
    groups.flatMap((group, index) =>
      group.options.flatMap((option) =>
        option.names.map((name) => [name, index] as const),
      ),
    ),
  );
  const core: TreeCore = {
    groups,
    lists,
    listOf,
    partOf,
    under,
    groupOf,
    draws: new Set(Object.keys(parts.layers)),
    unlit: new Set(groups.flatMap((group) => group.unlit ?? [])),
    echo: new Map(groups.flatMap((group) => Object.entries(group.echo ?? {}))),
    start: [],
  };
  core.start = defaults(core);
  return core;
}

// The walk of an assignment: every part the ship draws, in walk order, each with
// its group (or the group of the part above it, for a part of a list no group
// names). An echo layer is shown only beside one of its recorders, as the game
// shows a part only when the walk recorded its Id: a lower row of boxes stands
// bare when no reached place walked a box container (`echo` of the groups).
export function walkParts(core: TreeCore, assignment: Assignment) {
  const out: [string, number][] = [];
  const dig = (list: number, owner: number) => {
    const key = assignment[list];
    const here = core.unlit.has(key)
      ? NOT_A_GROUP
      : (core.groupOf.get(key) ?? owner);
    out.push([key, here]);
    for (const child of core.under.get(key) ?? []) {
      dig(child, here);
    }
  };
  core.lists.forEach((row, at) => {
    if (row.parent === null) {
      dig(at, NOT_A_GROUP);
    }
  });
  if (!core.echo.size) {
    return out;
  }
  const held = new Set(out.map(([key]) => key));
  const dead: string[] = [];
  for (const [layer, recorders] of core.echo) {
    if (held.has(layer) && !recorders.some((name) => held.has(name))) {
      dead.push(layer);
    }
  }
  if (!dead.length) {
    return out;
  }
  return out.filter(
    ([key]) => !dead.some((gone) => key === gone || key.startsWith(`${gone}.`)),
  );
}

// The layers the page draws for an assignment: the base, the layers of their own
// every ship carries (each left out where the walk holds `unless`), then the walk.
export function layersOf(
  ship: ShipModule,
  core: TreeCore,
  assignment: Assignment,
) {
  const walk = walkParts(core, assignment);
  const held = new Set(walk.map(([key]) => key));
  const out: [string, number][] = [[BASE, NOT_A_GROUP]];
  for (const { layer, unless } of ship.always) {
    if (!unless || !held.has(unless)) {
      out.push([layer, NOT_A_GROUP]);
    }
  }
  return out.concat(walk);
}

// The option each group stands on, read off the walk as the generator reads a
// seed's walk (crimson-orb `search/src/pick.rs`, `choose`): a group is on the page
// when the walk reaches a list one of its options names; it stands on the first
// option one of whose names the walk holds — for tied lists (`first`), on the
// option of the part the walk reaches first. The shared None of two branches
// (`nothing`) is taken only when the walk holds all it names.
export function choiceOf(core: TreeCore, assignment: Assignment): PartChoice {
  const walk = walkParts(core, assignment).map(([key]) => key);
  const held = new Set(walk);
  const place = new Map(walk.map((key, at) => [key, at] as const));
  const reached = new Set(walk.map((key) => core.listOf.get(key) as number));
  const out: PartChoice = {};
  core.groups.forEach((group) => {
    const applies = group.options.some((option) =>
      option.names.some((name) => reached.has(core.listOf.get(name) as number)),
    );
    if (!applies) {
      return;
    }
    let stand: { option: PartOption; at: number } | null = null;
    for (const option of group.options) {
      if (option.nothing) {
        continue;
      }
      if (group.chain) {
        if (option.names.every((name) => held.has(name))) {
          stand = { option, at: 0 };
        }
        continue;
      }
      const at = Math.min(
        ...option.names.map((name) => place.get(name) ?? Infinity),
      );
      if (at === Infinity) {
        continue;
      }
      if (!stand || (group.first && at < stand.at)) {
        stand = { option, at };
      }
    }
    for (const option of group.options) {
      if (option.nothing && option.names.every((name) => held.has(name))) {
        stand = { option, at: 0 };
      }
    }
    if (stand) {
      out[group.id] = stand.option.id;
    }
  });
  return out;
}

// The groups the walk reaches, in their order: the page's chips.
export function groupsOf(core: TreeCore, assignment: Assignment) {
  const choice = choiceOf(core, assignment);
  return core.groups.filter((group) => choice[group.id] !== undefined);
}

// One pick: the option's parts go to their lists, and the path from each to the
// top is set so the walk reaches them — through lists no group names, as the game
// reaches a part through the headings above it. A pick of tied lists (`first`)
// sets every place but forces none open, as the game shows one kind at every place
// the ship reaches. Nothing else changes: the parts of branches the walk leaves
// keep their values.
export function pick(
  core: TreeCore,
  assignment: Assignment,
  group: PartGroup,
  option: string,
): Assignment {
  const row = optionOf(group, option);
  if (!row) {
    return assignment;
  }
  const next = assignment.slice();
  const climb = (name: string) => {
    let up = core.lists[core.listOf.get(name) as number]?.parent;
    while (up) {
      next[up.list] = up.part;
      up = core.lists[up.list].parent;
    }
  };
  for (const name of row.names) {
    const list = core.listOf.get(name);
    if (list !== undefined) {
      next[list] = name;
    }
  }
  if (!group.first) {
    for (const name of row.names) {
      climb(name);
    }
  }
  // A cut length falls back on its depth's own stop: where the depth's list still
  // holds a pick that goes on, the stop comes in, and the path to it is set (the
  // spine's bridge kind sits under a carrier the climb reaches).
  if (row.stop !== undefined) {
    const goes = new Set(group.options.flatMap((option) => option.names));
    const list = core.listOf.get(row.stop);
    if (list !== undefined) {
      if (goes.has(next[list])) {
        next[list] = row.stop;
      }
      climb(row.stop);
    }
  }
  return opened(core, next, group, row);
}

// What the walk reaches under an option's own parts, the option's parts first.
function underOption(
  core: TreeCore,
  assignment: Assignment,
  row: PartOption,
): string[] {
  const out: string[] = [];
  const grow = (key: string) => {
    out.push(key);
    for (const list of core.under.get(key) ?? []) {
      grow(assignment[list]);
    }
  };
  for (const name of row.names) {
    grow(name);
  }
  return out;
}

// A pick must show: where the picked option still reads as, or draws the same
// nothing as, the shared None beside it (Stacked or Spread with no wings is the
// bare hull None draws), the first group under it that stands on nothing takes
// its first real option, so the pick is on the ship. The one rule the game does
// not have, since the game never clicks.
function opened(
  core: TreeCore,
  assignment: Assignment,
  group: PartGroup,
  row: PartOption,
): Assignment {
  if (
    row.empty ||
    row.nothing ||
    !group.options.some((other) => other.nothing)
  ) {
    return assignment;
  }
  let next = assignment;
  for (let guard = 0; guard < 8; guard += 1) {
    if (
      choiceOf(core, next)[group.id] === row.id &&
      underOption(core, next, row).some((key) => core.draws.has(key))
    ) {
      return next;
    }
    const below = branchOf(core, group);
    const choice = choiceOf(core, next);
    const bump = core.groups.find(
      (other, index) =>
        index !== core.groups.indexOf(group) &&
        below.has(index) &&
        optionOf(other, choice[other.id])?.empty &&
        firstOf(other),
    );
    if (!bump) {
      return next;
    }
    next = pick(core, next, bump, (firstOf(bump) as PartOption).id);
  }
  return next;
}

// The ship before any pick: every list on the part its group leaves empty, else
// on the part that leads to a group, else its first; then each group of the walk,
// parent first, on its empty option, else its first real one. The empty part
// comes first so a branch the walk has not reached yet is bare when a pick opens
// it (the spine's fins; the owner, 2026-11-07), as the reached groups are.
function defaults(core: TreeCore): Assignment {
  const named = new Set(
    core.groups.flatMap((group) =>
      group.options.flatMap((option) => option.names),
    ),
  );
  const left = new Set(
    core.groups.flatMap((group) =>
      group.options
        .filter((option) => option.empty && !option.nothing)
        .flatMap((option) => option.names),
    ),
  );
  const leads = (part: TreePart): boolean =>
    named.has(keyOf(part)) ||
    part.groups.some((list) => list.some((row) => leads(row)));
  // A pick that only makes a chain go on (Longer) is never a resting place: a
  // list starts on its stop, so a bare spine is one depth, not two.
  const goes = new Set(
    core.groups
      .filter((group) => group.chain)
      .flatMap((group) => group.options.flatMap((option) => option.names)),
  );
  let assignment: Assignment = core.lists.map(({ parts }) =>
    keyOf(
      parts.find((part) => left.has(keyOf(part))) ??
        parts.find((part) => leads(part) && !goes.has(keyOf(part))) ??
        parts.find((part) => leads(part)) ??
        parts[0],
    ),
  );
  for (const group of core.groups) {
    if (choiceOf(core, assignment)[group.id] === undefined) {
      continue;
    }
    const target =
      group.options.find((option) => option.empty && !option.nothing) ??
      firstOf(group);
    if (target) {
      assignment = pick(core, assignment, group, target.id);
    }
  }
  return assignment;
}

// An assignment from a walk the generator made of a seed: the walked parts go to
// their lists, every list the walk left keeps the start. The hook a found system's
// ship comes through.
export function fromWalk(core: TreeCore, names: string[]): Assignment {
  const next = core.start.slice();
  for (const name of names) {
    const list = core.listOf.get(name);
    if (list !== undefined) {
      next[list] = name;
    }
  }
  return next;
}

// The group and the groups that hang under its options' parts, by index: what
// lights up with it, and where `opened` looks.
export function branchOf(core: TreeCore, group: PartGroup) {
  const out = new Set([core.groups.indexOf(group)]);
  const dig = (key: string) => {
    for (const list of core.under.get(key) ?? []) {
      for (const part of core.lists[list].parts) {
        const inner = keyOf(part);
        const owner = core.groupOf.get(inner);
        if (owner !== undefined) {
          out.add(owner);
        }
        dig(inner);
      }
    }
  };
  for (const option of group.options) {
    for (const name of option.names) {
      dig(name);
    }
  }
  return out;
}

// What a tile shows: the parts this option puts on the ship as it stands now — the
// option's own parts and what the walk reaches under them. An option that puts
// nothing of its own there, as Hull plates Without, shows the ship it leaves: the
// parts every ship carries, without the `always` layers, which every option
// carries. A folded length, a tied group, and a merged nose use the baked tile
// from crimson-orb `ship_groups` instead: the part once, its sections multiplied,
// its mount under it, never the neighbours' state (the owner, 2026-11-08).
export function optionLayers(
  ship: ShipModule,
  parts: Parts,
  core: TreeCore,
  assignment: Assignment,
  group: PartGroup,
  option: string,
): [string, number][] {
  const row = optionOf(group, option);
  if (!row) {
    return [];
  }
  if (group.chain || group.first || group.baked || row.mount !== undefined) {
    // A tie's tile shows one placement where the art drew one apart (`@1`, the
    // capital's first container block; the owner, 2026-11-08).
    const one = (key: string) =>
      group.first && parts.layers[`${key}${TWIN}`] ? `${key}${TWIN}` : key;
    return (row.tile ?? [])
      .map(one)
      .filter((key) => parts.layers[key])
      .map((key) => [key, NOT_A_GROUP]);
  }
  if (row.empty) {
    return [];
  }
  const next = pick(core, assignment, group, option);
  const own = new Set(underOption(core, next, row));
  const walk = walkParts(core, next);
  const held = walk.filter(([key]) => own.has(key) && parts.layers[key]);
  if (held.length) {
    return held.map(([key]) => [key, NOT_A_GROUP]);
  }
  const always = new Set(ship.always.map(({ layer }) => layer));
  return layersOf(ship, core, next)
    .filter(
      ([key, owner]) =>
        owner === NOT_A_GROUP && parts.layers[key] && !always.has(key),
    )
    .map(([key]) => [key, NOT_A_GROUP]);
}
