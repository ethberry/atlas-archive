import groups from "@/lib/archive/interceptor-groups.json";
import looks from "@/lib/archive/interceptor-looks.json";
import known from "@/lib/archive/interceptor-forms.json";

// The parts a player can pick on /interceptor-finder. Groups follow the game's own
// tree of Interceptor parts (docs/ships/interceptors.md in crimson-orb), and `names`
// are its part names: a pick matches a system holding any one of them. An `empty`
// option comes first in its group and stands until the player picks another.
// `FORMS` holds one line per form that exists, one character per group: the index
// of its option, or `-` where the group does not apply. `FORM_LOOKS` holds the looks
// of each form, one bit per look, as a number below 2^53. A system holds one form in
// one look.

export type PartOption = {
  id: string;
  label: string;
  names: string[];
  empty?: boolean;
};

export type PartGroup = {
  id: string;
  title: string;
  // Only a ship with this pick can hold the group.
  requires?: { group: string; option: string };
  options: PartOption[];
};

export const PART_GROUPS = groups as PartGroup[];
export const FORMS = known.forms;
export const FORM_LOOKS = known.looks;

// Colour lies on two bands of the ship: the hull (upper hull, wing tops, closed
// wings) and the trim (cockpit pad, wing edges, light skirting). A scheme says what
// each band takes, and a family is a set of the game's paint colours a player calls
// by one name, in the order of `family` in crimson-orb `ship/interceptor.rs`.
export const FAMILIES = [
  "White",
  "Orange",
  "Yellow",
  "Red",
  "Blue",
  "Green",
].map((label, at) => ({ label, colour: looks.families[at] }));

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

// A colour pick; a family is null until the player picks it.
export type Paint = {
  scheme: number | null;
  hull: number | null;
  trim: number | null;
};

export const NO_PAINT: Paint = { scheme: null, hull: null, trim: null };

const SIZE = FAMILIES.length;
// Sentinel, a family on each of two schemes, and a pair of families.
export const LOOK_COUNT = 1 + 2 * SIZE + SIZE * SIZE;

// The look of a whole pick, numbered as `InterceptorPaint::look`, or null while a
// colour it needs is missing.
export function lookOf(paint: Paint): number | null {
  const { scheme, hull, trim } = paint;
  if (scheme === 0) {
    return 0;
  }
  if (scheme === 1 && hull !== null) {
    return 1 + hull;
  }
  if (scheme === 2 && trim !== null) {
    return 1 + SIZE + trim;
  }
  if (scheme === 3 && hull !== null && trim !== null) {
    return 1 + 2 * SIZE + SIZE * hull + trim;
  }
  return null;
}

// Every look that fits a pick, whole or not; all of them when nothing is picked.
export function looksOf(paint: Paint): number[] {
  const schemes = paint.scheme === null ? [0, 1, 2, 3] : [paint.scheme];
  const families = (value: number | null) =>
    value === null ? FAMILIES.map((_, at) => at) : [value];
  return schemes.flatMap((scheme) =>
    families(SCHEMES[scheme].hull ? paint.hull : 0).flatMap((hull) =>
      families(SCHEMES[scheme].trim ? paint.trim : 0).map(
        (trim) => lookOf({ scheme, hull, trim }) as number,
      ),
    ),
  );
}

// The two band colours of a pick, for a swatch; null where a colour is not picked.
export function bandsOf(paint: Paint): [string | null, string | null] {
  const colour = (value: number | null) =>
    value === null ? null : FAMILIES[value].colour;
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

// True when form `index` holds `look`. Masks pass 32 bits, so no bit operators.
export function formHolds(index: number, look: number) {
  return Math.floor(FORM_LOOKS[index] / 2 ** look) % 2 === 1;
}

export type PartChoice = Record<string, string>;

export function optionOf(group: PartGroup, id: string | undefined) {
  return group.options.find((option) => option.id === id);
}

// A test of forms against `choice`: each picked group must hold its option. Built
// once a choice, since the browser runs it over every form for every tile.
export function fitter(choice: PartChoice) {
  const wanted = PART_GROUPS.flatMap((group, index) => {
    const id = choice[group.id];
    return id === undefined
      ? []
      : [
          [
            index,
            group.options.findIndex((row) => row.id === id).toString(16),
          ] as const,
        ];
  });
  return (form: string) =>
    wanted.every(([index, option]) => form[index] === option);
}

// True when some form holds `choice`, in one of `looks` when they are given.
export function choiceExists(
  choice: PartChoice,
  looks: number[] | null = null,
) {
  const fits = fitter(choice);
  return FORMS.some(
    (form, index) =>
      fits(form) &&
      (looks === null || looks.some((look) => formHolds(index, look))),
  );
}

// `choice` with what no longer fits taken out and each empty option that now
// applies put in.
export function settled(choice: PartChoice) {
  const next = { ...choice };
  for (const group of PART_GROUPS) {
    const needs = group.requires;
    if (needs && next[needs.group] !== needs.option) {
      delete next[group.id];
    } else if (!next[group.id]) {
      const empty = group.options.find((option) => option.empty);
      if (empty) {
        next[group.id] = empty.id;
      }
    }
  }
  return next;
}

// `hull.a,cockpit.c`, sorted, so one choice is one address.
export function choiceKey(choice: PartChoice) {
  return Object.entries(choice)
    .map(([group, option]) => `${group}.${option}`)
    .sort()
    .join(",");
}

// A choice read from a request, or null when it names anything unknown.
export function parseChoice(text: string): PartChoice | null {
  const choice: PartChoice = {};
  for (const word of text.split(",").filter(Boolean)) {
    const [groupId, optionId] = word.split(".");
    const group = PART_GROUPS.find((row) => row.id === groupId);
    if (!group || !optionOf(group, optionId)) {
      return null;
    }
    choice[groupId] = optionId;
  }
  return choice;
}
