// The groups of a ship builder, over crimson-orb's part graph
// (docs/ships/part-graph.md): a group is a list of the game's tree whose parts draw
// different things, and `names` are the tree parts behind each option. The game
// takes one part from every list on its own, so every pick is a ship that exists.
// Each ship type brings its own groups, written by crimson-orb
// (`interceptor-groups.json` for the Interceptor). How the page holds and walks
// them is `tree.ts`.

export type PartOption = {
  id: string;
  label: string;
  names: string[];
  // On a folded length's option: the part its own depth falls back to when the
  // length is cut to here, the end cap of this depth (docs/ships/part-graph.md,
  // Folded chains, in crimson-orb).
  stop?: string;
  // The layers the option's tile draws, baked by crimson-orb `ship_groups`: the
  // picked part alone with what comes along under it (the owner, 2026-11-08).
  tile?: string[];
  // On a merged nose: the carrier the kind stands on (the turret tail under the
  // sphere), which its baked tile shows too.
  mount?: string;
  empty?: boolean;
  // A node of the graph with more than one parent: another branch draws it too, as
  // the Rings of Stacked and of the Pod. Never a default, so a pick shows what only
  // it draws.
  shared?: boolean;
  // The picture two options share where both draw nothing, offered once as None:
  // Wing set None is Stacked with no upper and no lower wings. Never a default.
  nothing?: boolean;
};

export type PartGroup = {
  id: string;
  title: string;
  // The group and the option (or any of the options) this one hangs on in the
  // graph. The page does not read it: whether a group is on the ship is read off
  // the walk (`tree.ts`).
  requires?: { group: string; option?: string; options?: string[] };
  // Tied lists folded into one group: each option names its part in every list
  // of the tie, and the one pick stands at every place the ship reaches, as the
  // containers of each cargo section of a capital freighter (docs/ships/
  // part-graph.md, Tied lists, in crimson-orb).
  first?: boolean;
  // A folded chain of nested length picks: an option stands only when the walk
  // holds every name of it, since a longer bay holds the shorter's first pick too
  // (docs/ships/part-graph.md, Folded chains, in crimson-orb).
  chain?: boolean;
  // A turnout's stop group (Row, Nose): its tiles are the baked ones.
  baked?: boolean;
  // Layers the ship draws under this group but does not light with it: the
  // cockpit end of a capital bay, the shield batteries by a nose (the owner,
  // 2026-11-08). The tiles leave them out too.
  unlit?: string[];
  // Layers the game shows only beside a recorder of their Id, each with its
  // recorders: the walk that skips a tied list records no Id for it, so a lower
  // row of boxes stands bare when no reached place walked a box container
  // (crimson-orb `part_graph::echoes`; the open racks of the players' photos).
  echo?: Record<string, string[]>;
  options: PartOption[];
};

// The option each group stands on, by group id: what the page sends with a search
// request, and what `search::pick` in crimson-orb reads a walk into.
export type PartChoice = Record<string, string>;

export function optionOf(group: PartGroup, id: string | undefined) {
  return group.options.find((option) => option.id === id);
}

// The option a group starts on where it has no empty one: the first real option
// that no other group draws too, else the first real one.
export function firstOf(group: PartGroup) {
  const real = group.options.filter((option) => !option.empty);
  return real.find((option) => !option.shared) ?? real[0];
}

// A chip's name is its title, and where another group that applies has the same
// title (each set of wings has its own Plate shade), the title of the group it
// hangs on, then a number.
export function chipNames(groups: PartGroup[], fits: PartGroup[]) {
  const title = (row: PartGroup) => {
    const same = fits.filter((other) => other.title === row.title);
    const parent = groups.find((up) => up.id === row.requires?.group);
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
