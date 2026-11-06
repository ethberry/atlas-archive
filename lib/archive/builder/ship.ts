import type { ShipPaint } from "./paint";
import type { PartGroup } from "./parts";

// What one ship type gives the builder: its groups, its pictures, its paint, and
// its texts. The builder (components/archive/builder) does the rest the same way
// for every ship (docs/ships/part-graph.md, Step 4, in crimson-orb).
export type ShipModule = {
  // The ship's name in a search request: `search_requests.kind` (the owner,
  // 2026-11-06).
  kind: string;
  // The folder under `public` of the ship's layers, `parts.json`, and paint maps,
  // written by its art script in crimson-orb.
  folder: string;
  // How its art script writes a layer (components/archive/builder/stage.ts):
  // `textured`, red the shade, green eight bits of depth, and `<name>.uv.png`
  // where it reads the paint (the Interceptor); `grey`, red the shade, green and
  // blue sixteen bits of depth, no paint (the living ships); `textured16`, a grey
  // layer with a deep `<name>.uv.png` (the freighters).
  format: "textured" | "grey" | "textured16";
  // The ship's groups, written by crimson-orb; the page walks them over the tree
  // of `parts.json` (lib/archive/builder/tree.ts).
  groups: PartGroup[];
  // Layers of their own drawn on every ship, outside the tree, each left out where
  // a pick names `unless`: the Interceptor's landing gear gives way to its walker
  // legs.
  always: { layer: string; unless?: string }[];
  // Absent on a ship that is only grey.
  paint?: ShipPaint;
  // The colour, 0 to 255 of the light, of a painted ship's pixel that reads no
  // paint; dark like glass when absent (`LENS` in stage.ts).
  bare?: number;
  // A react-intl id: the canvas's label.
  label: string;
};
