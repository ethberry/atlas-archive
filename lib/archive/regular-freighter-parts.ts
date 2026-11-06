import { FREIGHTER_PAINT } from "@/lib/archive/freighter-paint";
import groups from "@/lib/archive/regular-freighter-groups.json";
import type { PartGroup } from "@/lib/archive/builder/parts";
import type { ShipModule } from "@/lib/archive/builder/ship";

// The regular freighter on /freighter-finder, a builder. The groups are the choices
// of the game's own tree of regular freighter parts, written by crimson-orb
// `procgen/examples/ship_groups.rs` (docs/ships/freighters.md, The regular freighter
// on the part graph): the container lists of each kind are tied into one `first`
// group (the spine's Containers and Boxes, and the box's lower, upper, row, and end
// containers), and a group tied from lists that not every ship holds is `free`.
// Its colours are the system's, a hull and a trim colour of the `Freighter` palette
// (`freighter-paint.ts`). The box hull's
// built-in section (`Cargo_A`) is a layer of the tree, drawn with every box.
export const REGULAR_FREIGHTER: ShipModule = {
  kind: "regular-freighter",
  // Written by crimson-orb `utils/tools/ship_art pictures regular-freighter`.
  folder: "/freighter/regular",
  format: "textured16",
  groups: groups as PartGroup[],
  always: [],
  paint: FREIGHTER_PAINT,
  label: "archive.regularFreighterShip",
};
