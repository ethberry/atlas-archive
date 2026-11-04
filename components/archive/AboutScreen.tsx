"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import type { ReactNode } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { ChartBlock } from "@/components/archive/ChartBlock";
import { chartSpec } from "@/lib/archive/chart-spec";
import {
  Article,
  CellMark,
  DataTable,
  GalaxyLink,
} from "@/components/archive/Article";
import { GuidedTour } from "@/components/archive/GuidedTour";
import {
  amount,
  euclid,
  histogramRows,
  inVoxel,
  OWN_OFFERS,
  share,
  STARS_PER_REGION,
  stats,
  stepOf,
} from "@/lib/archive/about";
import { RANK_OPTIONS } from "@/lib/archive/kinds";

// The page in one narrowing column: each step links to the section that
// tells it.
function Tiles() {
  const steps = [
    [
      amount(stats.galaxy.systems),
      "star systems in a galaxy",
      "the-size-of-the-haystack",
    ],
    [
      amount(stepOf(euclid.tools, "ground")),
      "spots in one system that could hand you a multitool",
      "where-a-multitool-comes-from",
    ],
    [
      amount(stepOf(euclid.tools, "sources")),
      "of them above sea level and not too steep to build on",
      "the-multitool-funnel",
    ],
    [
      amount(stepOf(euclid.tools, "offers")),
      "chances at a multitool, by where you start",
      "where-a-multitool-comes-from",
    ],
    [
      amount(stepOf(euclid.tools, "connected")),
      "of them with four adjacent slots at S",
      "the-multitool-funnel",
    ],
    [
      "6 + 2",
      "multitools and ships on a system page",
      "what-a-good-system-looks-like",
    ],
    ["1", "square on show", "the-star-of-the-show"],
  ];
  return (
    <Stack
      component="nav"
      aria-label="On this page"
      spacing={0.75}
      sx={{ alignItems: "center" }}
    >
      {steps.map(([value, label, anchor], index) => (
        <Box
          key={label}
          component="a"
          href={`#${anchor}`}
          sx={(theme) => ({
            width: { xs: `${100 - index * 4}%`, sm: `${100 - index * 7}%` },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "center", sm: "baseline" },
            justifyContent: "center",
            columnGap: 1,
            py: 1,
            px: 2,
            borderRadius: 1,
            color: "text.primary",
            textDecoration: "none",
            textAlign: "center",
            bgcolor: alpha(theme.palette.primary.main, 0.08 + index * 0.05),
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.16 + index * 0.05),
            },
          })}
        >
          <Typography variant="h6" component="span">
            {value}
          </Typography>
          <Typography variant="body2" component="span" color="text.secondary">
            {label}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}

function Scale() {
  const { galaxy } = stats;
  const planets = euclid.planets_per_system;
  const rows: [string, number][] = [
    ["Voxels in a galaxy", galaxy.regions],
    ["Stars in a voxel", STARS_PER_REGION],
    ["Star systems in a galaxy", galaxy.systems],
    ["Planets and moons in a system", planets],
    ["Planets and moons in a voxel", planets * STARS_PER_REGION],
  ];
  return (
    <DataTable
      head={["The count", "About"]}
      rows={rows.map(([label, value]) => ({
        key: label,
        cells: [label, amount(value)],
      }))}
    />
  );
}

function Colours() {
  const shares = euclid.star_colours as Record<string, number>;
  const intl = useIntl();
  const rows = Object.entries(
    euclid.star_colours as Record<string, number>,
  ).sort((one, other) => other[1] - one[1]);
  return (
    <ChartBlock
      spec={chartSpec({
        kind: "bars",
        labels: rows.map(([colour]) =>
          intl.formatMessage({ id: `star.${colour}` }),
        ),
        series: [{ label: "Share", values: rows.map(([, value]) => value) }],
        format: "share",
        label: "Star colours",
      })}
    >
      <DataTable
        head={["Star", "Share"]}
        rows={Object.entries(shares)
          .sort((one, other) => other[1] - one[1])
          .map(([colour, value]) => ({
            key: colour,
            cells: [
              <FormattedMessage key={colour} id={`star.${colour}`} />,
              share(value),
            ],
          }))}
      />
    </ChartBlock>
  );
}

function Sources() {
  const spots = euclid.cells as Record<string, number>;
  const rows: [string, number][] = [
    ["Beacons", spots.beacon],
    ["Drop Pods", spots.droppod],
    ["Debris", spots.debris],
    ["Shops", spots.shop],
    ["Crashed freighters", spots.freighter],
    ["Monoliths", spots.monolith],
    ["Robot heads", spots.head],
    ["Sentinel pillars", spots.pillar],
    ["Harmonic camps", spots.camp],
    ["Space stations", spots.station / euclid.planets_per_system],
  ];
  // Fewest first: this table is no step of the funnel (the owner, 2026-11-04).
  rows.sort((one, other) => one[1] - other[1]);
  const total = rows.reduce((sum, [, spot]) => sum + spot, 0);
  return (
    <ChartBlock
      spec={chartSpec({
        kind: "bars",
        labels: rows.map(([label]) => label),
        series: [
          {
            label: "Share of all spots",
            values: rows.map(([, spot]) => spot / total),
          },
        ],
        format: "share",
        label: "Share of all spots",
      })}
    >
      <DataTable
        head={["Source", "Share of all spots"]}
        rows={rows.map(([label, spot]) => ({
          key: label,
          cells: [label, share(spot / total)],
        }))}
      />
    </ChartBlock>
  );
}

const STEP_LABELS: Record<string, string> = {
  ground: "All spots",
  sources: "Sea level and slope",
  // One spot offers a tool for every place you can start from.
  offers: `Chances, by where you start (×${Math.round(
    stepOf(euclid.tools, "offers") / stepOf(euclid.tools, "sources"),
  )})`,
  connected: "Four slots adjacent at S",
  square: "Four slots form a square",
  class: "Class S on the ground",
  own_load: "No trips needed",
  kept: "One per type and figure",
  shown: "On the list",
};

function Funnel(props: { steps: typeof euclid.tools }) {
  return (
    <ChartBlock
      spec={chartSpec({
        kind: "bars",
        labels: props.steps.map((step) => STEP_LABELS[step.key] ?? step.key),
        series: [
          {
            label: "System",
            values: props.steps.map((step) =>
              Math.log10(Math.max(step.per_system, 1)),
            ),
            exact: props.steps.map((step) => amount(step.per_system)),
          },
        ],
        format: "power",
        label: "Steps of the funnel, per system",
      })}
    >
      <DataTable
        head={["Step", "Planet", "System", "Voxel"]}
        rows={props.steps.map((step) => ({
          key: step.key,
          cells: [
            STEP_LABELS[step.key] ?? step.key,
            amount(step.per_planet),
            amount(step.per_system),
            amount(step.per_system * STARS_PER_REGION),
          ],
        }))}
      />
    </ChartBlock>
  );
}

// Counts too far apart for one straight scale, as powers of ten. Under one in
// a voxel draws no bar; the tooltip and the table keep the number.
function countSeries(label: string, values: number[]) {
  return {
    label,
    values: values.map((value) => Math.log10(Math.max(value, 1))),
    exact: values.map((value) => amount(value)),
  };
}

// Types that read as one family stay together in the table.
const TOOL_GROUPS = [
  ["pistol"],
  ["rifle"],
  ["atlantid-plain", "atlantid-yellow", "atlantid-blue"],
  ["sentinel-pistol", "sentinel-rifle"],
  ["experimental"],
  ["alien"],
  ["royal"],
];

const STAFF_TYPES = [
  "staff-transducer",
  "staff-aerator",
  "staff-coil",
  "staff-claw",
  "staff-head",
  "staff-heart",
  "staff-focus",
];

// The part of `shares` that `types` hold, summing to one.
function among(
  shares: Record<string, number>,
  types: string[],
): Record<string, number> {
  const total = types.reduce((sum, type) => sum + (shares[type] ?? 0), 0);
  return Object.fromEntries(
    types.map((type) => [type, total ? (shares[type] ?? 0) / total : 0]),
  );
}

// Largest family first, and largest type first inside a family.
function orderedTypes(shares: Record<string, number>, types: string[]) {
  const of = (type: string) => shares[type] ?? 0;
  const total = (group: string[]) =>
    group.reduce((sum, type) => sum + of(type), 0);
  const groups = TOOL_GROUPS.filter((group) => types.includes(group[0]));
  return [...(groups.length ? groups : [types])]
    .sort((left, right) => total(right) - total(left))
    .flatMap((group) => [...group].sort((left, right) => of(right) - of(left)));
}

const SOURCE_NAMES: [string, string][] = [
  ["shop", "Shop"],
  ["monolith", "Monolith"],
  ["camp", "Camp"],
  ["station", "Space station"],
  ["pillar", "Pillar"],
  ["head", "Robot head"],
  ["beacon", "Beacon"],
  ["freighter", "Crashed freighter"],
  ["droppod", "Drop Pod"],
  ["debris", "Debris"],
];

// The kinds of place that pay a type.
function paidBy(counts: Record<string, number> | undefined): string {
  const names = SOURCE_NAMES.filter(([kind]) => (counts?.[kind] ?? 0) > 0);
  return names.length ? names.map(([, name]) => name).join(", ") : "—";
}

function TypeTable(props: { types: string[] }) {
  const bySource = (
    euclid as { by_type_source?: Record<string, Record<string, number>> }
  ).by_type_source;
  const all = inVoxel(euclid.tool_types, OWN_OFFERS);
  const kept = inVoxel(euclid.kept_tool_types, stepOf(euclid.tools, "kept"));
  const order = orderedTypes(among(all, props.types), props.types);
  const intl = useIntl();
  return (
    <ChartBlock
      spec={chartSpec({
        kind: "bars",
        labels: order.map((type) =>
          intl.formatMessage({ id: `toolBody.${type}` }),
        ),
        series: [
          countSeries(
            "All sources",
            order.map((type) => all[type] ?? 0),
          ),
          countSeries(
            "We keep",
            order.map((type) => kept[type] ?? 0),
          ),
        ],
        format: "power",
        label: "Tool types in a voxel, all sources and what we keep",
      })}
    >
      <DataTable
        head={["Type", "All sources", "From", "We keep"]}
        rows={order.map((type) => ({
          key: type,
          cells: [
            <FormattedMessage key={type} id={`toolBody.${type}`} />,
            amount(all[type] ?? 0),
            paidBy(bySource?.[type]),
            amount(kept[type] ?? 0),
          ],
        }))}
      />
    </ChartBlock>
  );
}

function Types() {
  return <TypeTable types={TOOL_GROUPS.flat()} />;
}

function Staffs() {
  return <TypeTable types={STAFF_TYPES} />;
}

const FIGURE_CELLS: Record<string, [number, number][]> = {
  I: [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
  ],
  O: [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ],
  T: [
    [0, 0],
    [1, 0],
    [2, 0],
    [1, 1],
  ],
  S: [
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
  ],
  Z: [
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
  ],
  J: [
    [1, 0],
    [1, 1],
    [0, 2],
    [1, 2],
  ],
  L: [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 2],
  ],
};

// One row for a shape and everything it turns or mirrors into. Places count
// where the shape fits on a multitool's 7 by 4 and a ship's 10 by 3.
const SHAPES = [
  { mark: "I", name: "Line", members: ["I"], turns: 2, tool: 23, ship: 21 },
  { mark: "O", name: "Square", members: ["O"], turns: 1, tool: 18, ship: 18 },
  { mark: "T", name: "T", members: ["T"], turns: 4, tool: 54, ship: 50 },
  {
    mark: "S",
    name: "Zigzag",
    members: ["S", "Z"],
    turns: 4,
    tool: 54,
    ship: 50,
  },
  {
    mark: "L",
    name: "Corner",
    members: ["L", "J"],
    turns: 8,
    tool: 108,
    ship: 100,
  },
];

function Figures() {
  const tools = euclid.tool_figures as Record<string, number>;
  const ships = euclid.kept_ship_figures as Record<string, number>;
  const total = (shares: Record<string, number>, members: string[]) =>
    members.reduce((sum, member) => sum + (shares[member] ?? 0), 0);
  return (
    <ChartBlock
      spec={chartSpec({
        kind: "bars",
        labels: SHAPES.map((shape) => shape.name),
        series: [
          {
            label: "Adjacent tools",
            values: SHAPES.map((shape) => total(tools, shape.members)),
          },
          {
            label: "Ships we keep",
            values: SHAPES.map((shape) => total(ships, shape.members)),
          },
        ],
        format: "share",
        label: "Figures of adjacent tools and of ships we keep",
      })}
    >
      <DataTable
        head={[
          "Shape",
          "Name",
          "Turns",
          "Places",
          "Adjacent tools",
          "Ships we keep",
        ]}
        textColumns={2}
        rows={SHAPES.map((shape) => ({
          key: shape.mark,
          cells: [
            <Stack
              key={shape.mark}
              sx={{
                alignItems: "flex-start",
                justifyContent: "center",
                minHeight: 52,
              }}
            >
              <CellMark cells={FIGURE_CELLS[shape.mark]} />
            </Stack>,
            shape.name,
            shape.turns,
            `${shape.tool} / ${shape.ship}`,
            share(total(tools, shape.members)),
            share(total(ships, shape.members)),
          ],
        }))}
      />
    </ChartBlock>
  );
}

function Classes() {
  const columns = [
    ["All tools", inVoxel(euclid.tool_classes, OWN_OFFERS)],
    [
      "Tools we keep",
      inVoxel(euclid.kept_tool_classes, stepOf(euclid.tools, "kept")),
    ],
    [
      "All wrecks",
      inVoxel(euclid.ship_classes, stepOf(euclid.ships, "sources")),
    ],
    [
      "Ships we keep",
      inVoxel(euclid.kept_ship_classes, stepOf(euclid.ships, "kept")),
    ],
  ] as const;
  return (
    <ChartBlock
      spec={chartSpec({
        kind: "bars",
        labels: RANK_OPTIONS.map((letter) => letter),
        series: columns.map(([label, counts]) =>
          countSeries(
            label,
            RANK_OPTIONS.map((letter) => counts[letter] ?? 0),
          ),
        ),
        format: "power",
        label: "Classes of tools and wrecks in a voxel",
      })}
    >
      <DataTable
        head={[
          "Class",
          "All tools",
          "Tools we keep",
          "All wrecks",
          "Ships we keep",
        ]}
        rows={RANK_OPTIONS.map((letter) => ({
          key: letter,
          cells: [
            letter,
            ...columns.map(([, counts]) => amount(counts[letter] ?? 0)),
          ],
        }))}
      />
    </ChartBlock>
  );
}

function Hulls() {
  const all = inVoxel(euclid.ship_hulls, stepOf(euclid.ships, "sources"));
  const kept = inVoxel(euclid.kept_ship_hulls, stepOf(euclid.ships, "kept"));
  const intl = useIntl();
  const order = Object.entries(all).sort((one, other) => other[1] - one[1]);
  return (
    <ChartBlock
      spec={chartSpec({
        kind: "bars",
        labels: order.map(([hull]) =>
          intl.formatMessage({ id: `hull.${hull}` }),
        ),
        series: [
          countSeries(
            "All wrecks",
            order.map(([, value]) => value),
          ),
          countSeries(
            "We keep",
            order.map(([hull]) => kept[hull] ?? 0),
          ),
        ],
        format: "power",
        label: "Ship types in a voxel, among wrecks and ships we keep",
      })}
    >
      <DataTable
        head={["Ship", "All wrecks", "We keep"]}
        rows={order.map(([hull, value]) => ({
          key: hull,
          cells: [
            <FormattedMessage key={hull} id={`hull.${hull}`} />,
            amount(value),
            amount(kept[hull] ?? 0),
          ],
        }))}
      />
    </ChartBlock>
  );
}

function Histogram() {
  return (
    <ChartBlock
      spec={chartSpec({
        kind: "line",
        labels: histogramRows().map((row) => row.label),
        series: [
          {
            label: "Systems, by tools",
            values: histogramRows().map((row) => row.tools),
          },
          {
            label: "Systems, by ships",
            values: histogramRows().map((row) => row.ships),
          },
        ],
        format: "share",
        label: "Systems by items kept",
      })}
    >
      <DataTable
        head={["Items kept", "Systems, by tools", "Systems, by ships"]}
        rows={histogramRows().map((row) => ({
          key: row.label,
          cells: [row.label, share(row.tools), share(row.ships)],
        }))}
      />
    </ChartBlock>
  );
}

function Galaxies() {
  const all = [stats.euclid, ...stats.galaxies];
  return (
    <ChartBlock
      spec={chartSpec({
        kind: "bars",
        labels: all.map((galaxy) => galaxy.name.replace(" Galaxy", "")),
        series: [
          {
            label: "Tools per system",
            values: all.map((galaxy) => stepOf(galaxy.tools, "offers")),
            exact: all.map((galaxy) => amount(stepOf(galaxy.tools, "offers"))),
          },
        ],
        format: "count",
        label: "Tools per system by galaxy",
      })}
    >
      <DataTable
        head={[
          "Galaxy",
          "Stars per voxel",
          "Tools per system",
          "Wrecks per system",
        ]}
        rows={all.map((galaxy) => ({
          key: galaxy.name,
          cells: [
            <>
              <GalaxyLink name={galaxy.name.replace(" Galaxy", "")} />
              {" ("}
              <FormattedMessage id={`galaxyType.${galaxy.type}`} />
              {")"}
            </>,
            amount(galaxy.stars_per_region),
            amount(stepOf(galaxy.tools, "offers")),
            amount(stepOf(galaxy.ships, "sources")),
          ],
        }))}
      />
    </ChartBlock>
  );
}

const WIDGETS: Record<string, () => ReactNode> = {
  tiles: Tiles,
  scale: Scale,
  colours: Colours,
  sources: Sources,
  toolFunnel: () => <Funnel steps={euclid.tools} />,
  types: Types,
  staffs: Staffs,
  figures: Figures,
  classes: Classes,
  shipFunnel: () => <Funnel steps={euclid.ships} />,
  hulls: Hulls,
  histogram: Histogram,
  galaxies: Galaxies,
};

// How it works: its text, its widgets, and the guided tour.
export function AboutScreen(props: { html: string }) {
  return (
    <Stack spacing={1}>
      <GuidedTour />
      <Article html={props.html} widgets={WIDGETS} />
    </Stack>
  );
}
