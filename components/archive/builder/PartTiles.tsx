import { useEffect, useRef, type RefObject } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";

import {
  HIDDEN,
  buildStage,
  paintTexture,
  toneAt,
} from "@/components/archive/builder/stage";
import { TILE } from "@/components/archive/builder/style";
import type { PartGroup } from "@/lib/archive/builder/parts";
import type { ShipModule } from "@/lib/archive/builder/ship";
import {
  optionLayers,
  type Assignment,
  type Parts,
  type TreeCore,
} from "@/lib/archive/builder/tree";

// Each tile is one fixed picture of its part on the start ship, never the
// neighbours' state. Options that stand on one mount share one camera — the box
// that holds them all — so the mount is the same size under the disc, the
// sphere, and the ring (the owner, 2026-11-08); every other option keeps its
// own box.
function useTiles(
  ship: ShipModule,
  parts: Parts | null,
  core: TreeCore | null,
  assignment: Assignment | null,
  group: PartGroup,
  canvases: RefObject<Record<string, HTMLCanvasElement | null>>,
) {
  useEffect(() => {
    if (!parts || !core || !assignment) {
      return;
    }
    let current = true;
    const drawn = group.options.filter(
      (option) =>
        optionLayers(ship, parts, core, assignment, group, option.id).length,
    );
    void Promise.all([
      Promise.all(
        drawn.map((option) =>
          buildStage(
            ship,
            parts,
            optionLayers(ship, parts, core, assignment, group, option.id),
          ),
        ),
      ),
      ship.paint
        ? paintTexture(ship.folder, ship.paint.tone).catch(() => null)
        : null,
    ]).then(([stages, texture]) => {
      if (!current) {
        return;
      }
      const { width, height } = parts;
      const boxes = new Map<string, [number, number, number, number]>();
      drawn.forEach((option, index) => {
        const camera = option.mount ?? option.id;
        let [left, top, right, bottom] = boxes.get(camera) ?? [
          width,
          height,
          -1,
          -1,
        ];
        stages[index].group.forEach((owner, at) => {
          if (owner !== HIDDEN) {
            const [x, y] = [at % width, Math.floor(at / width)];
            [left, top] = [Math.min(left, x), Math.min(top, y)];
            [right, bottom] = [Math.max(right, x), Math.max(bottom, y)];
          }
        });
        boxes.set(camera, [left, top, right, bottom]);
      });
      drawn.forEach((option, index) => {
        const canvas = canvases.current?.[option.id];
        const context = canvas?.getContext("2d");
        const [left, top, right, bottom] = boxes.get(
          option.mount ?? option.id,
        ) as [number, number, number, number];
        if (!canvas || !context || right < 0) {
          return;
        }
        const [across, down] = [right - left + 1, bottom - top + 1];
        const stage = stages[index];
        canvas.width = across;
        canvas.height = down;
        const image = context.createImageData(across, down);
        for (let y = 0; y < down; y += 1) {
          for (let x = 0; x < across; x += 1) {
            const at = (top + y) * width + left + x;
            const to = (y * across + x) * 4;
            if (stage.group[at] !== HIDDEN) {
              const value = stage.shade[at] * toneAt(stage, texture, at);
              image.data[to] = value;
              image.data[to + 1] = value * 0.62;
              image.data[to + 2] = value * 0.36;
              image.data[to + 3] = 255;
            }
          }
        }
        context.putImageData(image, 0, 0);
      });
    });
    return () => {
      current = false;
    };
  }, [ship, parts, core, assignment, group, canvases]);
}

// The options of the open group, each a fixed tile of the part it picks.
export function PartTiles(props: {
  ship: ShipModule;
  parts: Parts | null;
  core: TreeCore | null;
  assignment: Assignment | null;
  group: PartGroup;
  value: string | undefined;
  title: string;
  onChange: (option: string) => void;
}) {
  const { ship, parts, core, assignment, group, value, title, onChange } =
    props;
  const canvases = useRef<Record<string, HTMLCanvasElement | null>>({});
  useTiles(ship, parts, core, assignment, group, canvases);
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">{title}</Typography>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={value ?? null}
        // A click on the picked option leaves it: a list always holds a part.
        onChange={(_event, option: string | null) => {
          if (option !== null) {
            onChange(option);
          }
        }}
        aria-label={title}
        sx={{ flexWrap: "wrap", gap: 1 }}
      >
        {group.options.map((option) => (
          <ToggleButton key={option.id} value={option.id} sx={TILE}>
            <Box sx={{ height: 72, display: "flex", alignItems: "center" }}>
              {parts &&
              core &&
              assignment &&
              optionLayers(ship, parts, core, assignment, group, option.id)
                .length ? (
                <Box
                  component="canvas"
                  ref={(node: HTMLCanvasElement | null) => {
                    canvases.current[option.id] = node;
                  }}
                  width={0}
                  height={0}
                  aria-hidden
                  sx={{ maxWidth: 116, maxHeight: 72 }}
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
