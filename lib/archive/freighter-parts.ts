import capitalGroups from "@/lib/archive/freighter-groups.json";
import capitalForms from "@/lib/archive/freighter-forms.json";
import regularGroups from "@/lib/archive/regular-freighter-groups.json";
import regularForms from "@/lib/archive/regular-freighter-forms.json";
import livingGroups from "@/lib/archive/living-ship-groups.json";
import livingForms from "@/lib/archive/living-ship-forms.json";
import type {
  PartChoice,
  PartGroup,
  PartOption,
} from "@/lib/archive/interceptor-parts";

// The parts a player can pick on /capital-freighter-finder, /freighter-finder and
// /living-ship-finder, for each kind of ship. Groups follow the game's own tree of
// parts (docs/ships/freighters.md and docs/ships/living-ships.md in crimson-orb), and `names` are its part names: a pick matches a ship holding any
// one of them. `owns` names more parts whose pictures belong to the group, such as
// the sections of a spine, without matching on them. `forms` holds one line per
// form that exists, one character per group: the index of its option, or `-` where
// the group does not apply. A group nobody picks stays open.

export type FreighterKind = "capital" | "regular" | "living";

// The kinds /api/freighter-finder holds a table for.
export type SearchedKind = "capital" | "regular";

// `whole`: the option's tile draws the groups that hang on it with their first
// part, not their empty one, since it has no picture of its own (the open
// underside of a living ship is only its belly and pedals).
// `swatch`: a colour option's tile, as the game shows the colour; such an option
// names no part of the picture.
export type FreighterOption = PartOption & { whole?: boolean; swatch?: string };

// `first`: the group's parts stand at several places of one ship and the first
// the walk meets sets them all, as the containers of every cargo section of a
// capital freighter (docs/ships/freighters.md in crimson-orb).
// `free`: the group is no part of a form, since every form holds each of its
// options, as the containers of a box regular freighter; its character in a
// form is `-`. `tile`: picks of other groups an option's tile is drawn with,
// where the option shows nothing without them (row containers need a row).
export type FreighterGroup = Omit<PartGroup, "options"> & {
  owns?: string[];
  first?: boolean;
  free?: boolean;
  tile?: PartChoice;
  options: FreighterOption[];
};

// `layers`: the folder of the part pictures under public/.
type Kind = { groups: FreighterGroup[]; forms: string[]; layers: string };

export const FREIGHTER_KINDS: Record<FreighterKind, Kind> = {
  capital: {
    groups: capitalGroups,
    forms: capitalForms.forms,
    layers: "/freighter/capital",
  },
  regular: {
    groups: regularGroups,
    forms: regularForms.forms,
    layers: "/freighter/regular",
  },
  living: {
    groups: livingGroups,
    forms: livingForms.forms,
    layers: "/living-ship",
  },
};

export function isFreighterKind(text: string | null): text is SearchedKind {
  return text === "capital" || text === "regular";
}

export function freighterOption(group: FreighterGroup, id: string | undefined) {
  return group.options.find((option) => option.id === id);
}

// True when `group` applies to `choice`.
export function applies(group: FreighterGroup, choice: PartChoice) {
  const needs = group.requires;
  return !needs || choice[needs.group] === needs.option;
}

function formFits(groups: FreighterGroup[], form: string, choice: PartChoice) {
  return groups.every((group, index) => {
    const id = choice[group.id];
    return (
      id === undefined ||
      group.free ||
      form[index] ===
        group.options.findIndex((row) => row.id === id).toString(16)
    );
  });
}

// The place in its kind's list of the first form that fits `choice`, or -1.
export function freighterForm(kind: FreighterKind, choice: PartChoice) {
  const { groups, forms } = FREIGHTER_KINDS[kind];
  return forms.findIndex((form) => formFits(groups, form, choice));
}

// `choice` with each pick whose group no longer applies taken out.
export function settledFreighter(kind: FreighterKind, choice: PartChoice) {
  const next: PartChoice = {};
  for (const group of FREIGHTER_KINDS[kind].groups) {
    if (choice[group.id] !== undefined && applies(group, next)) {
      next[group.id] = choice[group.id];
    }
  }
  return next;
}

// `hull.box,top.tower`, sorted, so one choice is one address.
export function freighterKey(choice: PartChoice) {
  return Object.entries(choice)
    .map(([group, option]) => `${group}.${option}`)
    .sort()
    .join(",");
}

// A choice read from a request, or null when it names anything unknown or a
// group that does not apply.
export function parseFreighter(
  kind: FreighterKind,
  text: string,
): PartChoice | null {
  const choice: PartChoice = {};
  for (const word of text.split(",").filter(Boolean)) {
    const [groupId, optionId] = word.split(".");
    const group = FREIGHTER_KINDS[kind].groups.find(
      (row) => row.id === groupId,
    );
    if (!group || !freighterOption(group, optionId)) {
      return null;
    }
    choice[groupId] = optionId;
  }
  const settled = settledFreighter(kind, choice);
  return freighterKey(settled) === freighterKey(choice) ? choice : null;
}
