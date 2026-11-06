import groups from "@/lib/archive/living-ship-groups.json";
import { LIVING_SHIP_PAINT } from "@/lib/archive/living-ship-paint";
import type { PartGroup } from "@/lib/archive/builder/parts";
import type { ShipModule } from "@/lib/archive/builder/ship";

// The living ship on /living-ship-finder, a builder. The groups are the choices of
// the game's own tree of living ship parts, written by crimson-orb
// `procgen/examples/ship_groups.rs` (docs/ships/living-ships.md, The part graph).
// Its colours are a paint, as the Interceptor's (`living-ship-paint.ts`).

// The feelers: a living ship comes from a DistressSignal crash site, and the walk
// of every such seed draws them (crimson-orb docs/ships/living-ships.md, The NMSCE
// check), so they are on every ship and no pick of theirs is offered.
const FEELERS_GROUP = "TopAcc_A";
const FEELERS_LAYER = "_TopAcc_A";

// The light grey of the parts that read no paint. Our own choice.
const LIVING_BARE = 200;

export const LIVING_SHIP: ShipModule = {
  kind: "living-ship",
  // Written by crimson-orb `utils/tools/ship_art pictures living-ship`.
  folder: "/living-ship",
  format: "textured16",
  groups: (groups as PartGroup[]).filter((group) => group.id !== FEELERS_GROUP),
  always: [{ layer: FEELERS_LAYER }],
  paint: LIVING_SHIP_PAINT,
  // The shell of the head and the flash read their own maps, no paint: they keep a
  // pale grey, as the grey pictures drew them. Our own choice.
  bare: LIVING_BARE,
  label: "archive.livingShip",
};
