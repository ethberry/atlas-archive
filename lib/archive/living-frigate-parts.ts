import groups from "@/lib/archive/living-frigate-groups.json";
import type { PartGroup } from "@/lib/archive/builder/parts";
import type { ShipModule } from "@/lib/archive/builder/ship";

// The living frigate, the whale of the Dream Aerial, on /living-frigate-finder, a
// builder. The groups are the choices of the game's own tree of living frigate
// parts, written by crimson-orb `procgen/examples/ship_groups.rs` (docs/ships/
// living-ships.md, Organic frigates): one hull with five lists, the front
// accessory, the tail, the wings, the side detail, and the front wings. Its
// colours come from procedural textures that are not read, so the ship is grey.
export const LIVING_FRIGATE: ShipModule = {
  kind: "living-frigate",
  // Written by crimson-orb `utils/tools/ship_art pictures living-frigate`.
  folder: "/living-frigate",
  format: "grey",
  groups: groups as PartGroup[],
  always: [],
  label: "archive.livingFrigateShip",
};
