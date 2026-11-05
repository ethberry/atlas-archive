import groups from "@/lib/archive/interceptor-groups.json";
import looks from "@/lib/archive/interceptor-looks.json";

// The parts a player can pick on /interceptor-finder, the Interceptor builder. The
// groups are the forks of the game's own tree of Interceptor parts, written by
// crimson-orb `procgen/examples/interceptor_groups.rs` (docs/ships/seed-to-picture.md):
// a group is a list whose parts draw different things, shown once the part it hangs
// on is picked, and `names` are the parts of the list that draw alike. The game takes
// one part from every list on its own, so every pick with every colour is a ship
// that exists.

export type PartOption = {
  id: string;
  label: string;
  names: string[];
  empty?: boolean;
  // Can draw nothing at all: every group under it can stand empty (Stacked, Spread,
  // Frame). From the graph of crimson-orb `procgen/examples/interceptor_groups.rs`.
  vanishes?: boolean;
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
  // Only a ship with this pick can hold the group.
  requires?: { group: string; option: string };
  options: PartOption[];
};

export const PART_GROUPS = groups as PartGroup[];

// Colour lies on two bands of the ship: the hull (upper hull, wing tops, closed
// wings) and the trim (cockpit pad, wing edges, light skirting). A scheme says what
// each band takes, and each band takes one of the 64 colours of `PAINT` in crimson-orb
// `ship/interceptor.rs`, the colours the game paints with, shown in the game's own
// order: eight rows of eight, a few colours twice (the owner, 2026-11-05).
export const PAINT = looks.paint;

export type Scheme = {
  id: string;
  label: string;
  // Which bands the player picks a colour for.
  hull: boolean;
  trim: boolean;
};

export const SCHEMES: Scheme[] = [
  { id: "sentinel", label: "Sentinel orange", hull: false, trim: false },
  { id: "white", label: "Colour and white", hull: true, trim: false },
  { id: "black", label: "Black with colour trim", hull: false, trim: true },
  { id: "two", label: "Two colours", hull: true, trim: true },
];

// A colour pick: a cell of `PAINT` for each band, null until the player picks it.
export type Paint = {
  scheme: number | null;
  hull: number | null;
  trim: number | null;
};

export const NO_PAINT: Paint = { scheme: null, hull: null, trim: null };

// What the texture needs: the overlay of `bake` in crimson-orb
// `utils/tools/interceptor_art.py` (1 to 4) and the colours it multiplies.
export type Painted = {
  option: number;
  primary: string;
  secondary: string | null;
};

// The paint of a whole pick, or null while a colour it needs is missing. Overlay 1 is
// Sentinel orange over white, 2 a hull colour and white trim, 3 a black hull and
// trim colour, 4 a hull colour and a trim colour (`InterceptorPaint::look`).
export function paintedOf(paint: Paint): Painted | null {
  const { scheme, hull, trim } = paint;
  if (scheme === 0) {
    return { option: 1, primary: PAINT[0], secondary: null };
  }
  if (scheme === 1 && hull !== null) {
    return { option: 2, primary: PAINT[hull], secondary: null };
  }
  if (scheme === 2 && trim !== null) {
    return { option: 3, primary: PAINT[trim], secondary: null };
  }
  if (scheme === 3 && hull !== null && trim !== null) {
    return { option: 4, primary: PAINT[trim], secondary: PAINT[hull] };
  }
  return null;
}

// The two band colours of a pick, for a swatch; null where a colour is not picked.
export function bandsOf(paint: Paint): [string | null, string | null] {
  const colour = (value: number | null) =>
    value === null ? null : PAINT[value];
  switch (paint.scheme) {
    case 0:
      return [looks.sentinel[0], looks.sentinel[1]];
    case 1:
      return [colour(paint.hull), looks.white];
    case 2:
      return [looks.black, colour(paint.trim)];
    case 3:
      return [colour(paint.hull), colour(paint.trim)];
    default:
      return [null, null];
  }
}

export type PartChoice = Record<string, string>;

export function optionOf(group: PartGroup, id: string | undefined) {
  return group.options.find((option) => option.id === id);
}

// The option the builder puts in for the player: the first real one that no other
// group draws too, else the first real one.
export function firstOf(group: PartGroup) {
  const real = group.options.filter((option) => !option.empty);
  return real.find((option) => !option.shared) ?? real[0];
}

// `choice` with each group that no longer hangs on a pick taken out, and each group
// that now does set to its empty option, or to `firstOf` where it has none: the
// game takes a part from every list, so no group stands open. Groups come parent
// first, so one pass settles a whole branch.
export function settled(choice: PartChoice) {
  const next = { ...choice };
  for (const group of PART_GROUPS) {
    const needs = group.requires;
    if (needs && next[needs.group] !== needs.option) {
      delete next[group.id];
    } else if (!optionOf(group, next[group.id])) {
      next[group.id] = (
        group.options.find((option) => option.empty && !option.nothing) ??
        firstOf(group)
      ).id;
    }
  }
  return next;
}
