"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import {
  amount,
  euclid,
  histogramRows,
  share,
  STARS_PER_REGION,
  stats,
  stepOf,
} from "@/lib/archive/about";

type Row = { key: string; cells: ReactNode[] };

function DataTable(props: { caption?: string; head: string[]; rows: Row[] }) {
  const { caption, head, rows } = props;
  return (
    <Card variant="outlined">
      <TableContainer>
        <Table size="small" aria-label={caption ?? head[0]}>
          <TableHead>
            <TableRow>
              {head.map((title, index) => (
                <TableCell key={title} align={index ? "right" : "left"}>
                  {title}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.key}>
                {row.cells.map((cell, index) => (
                  <TableCell key={index} align={index ? "right" : "left"}>
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

function Tiles() {
  const tiles = [
    [amount(stats.galaxy.systems), "star systems in a galaxy"],
    [amount(stepOf(euclid.tools, "offers")), "chances at a tool per system"],
    [`${stats.grids.tool}`, "ways to lay four touching slots"],
    ["6 + 2", "at most on a system page"],
  ];
  return (
    <Grid container spacing={2}>
      {tiles.map(([value, label]) => (
        <Grid key={label} size={{ xs: 6, md: 3 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h5" component="p">
                {value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {label}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
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
  return (
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
  const total = rows.reduce((sum, [, spot]) => sum + spot, 0);
  return (
    <DataTable
      head={["Source", "Share of all spots"]}
      rows={rows.map(([label, spot]) => ({
        key: label,
        cells: [label, share(spot / total)],
      }))}
    />
  );
}

const STEP_LABELS: Record<string, string> = {
  sources: "Sources",
  offers: "Chances, by where you start",
  connected: "Four slots touch at S",
  square: "Four slots form a square",
  class: "Class S on the ground",
  own_load: "No trips needed",
  kept: "One per type and figure",
  shown: "On the list",
};

function Funnel(props: { steps: typeof euclid.tools }) {
  return (
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
  );
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
  const all = among(euclid.tool_types, props.types);
  const kept = among(euclid.kept_tool_types, props.types);
  return (
    <DataTable
      head={["Type", "All sources", "From", "We keep"]}
      rows={orderedTypes(all, props.types).map((type) => ({
        key: type,
        cells: [
          <FormattedMessage key={type} id={`toolBody.${type}`} />,
          (all[type] ?? 0) < 0.0001 ? "under 0.01%" : share(all[type] ?? 0),
          paidBy(bySource?.[type]),
          share(kept[type] ?? 0),
        ],
      }))}
    />
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

function FigureMark(props: { figure: string }) {
  const cells = FIGURE_CELLS[props.figure];
  const columns = Math.max(...cells.map((cell) => cell[0])) + 1;
  const rows = Math.max(...cells.map((cell) => cell[1])) + 1;
  return (
    <Box
      aria-hidden
      sx={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 12px)`,
        gridTemplateRows: `repeat(${rows}, 12px)`,
        gap: "2px",
      }}
    >
      {cells.map(([column, row]) => (
        <Box
          key={`${column}.${row}`}
          sx={{
            gridColumn: column + 1,
            gridRow: row + 1,
            bgcolor: "primary.main",
            borderRadius: "2px",
          }}
        />
      ))}
    </Box>
  );
}

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
    <DataTable
      head={["Shape", "Turns", "Places", "Touching tools", "Ships we keep"]}
      rows={SHAPES.map((shape) => ({
        key: shape.mark,
        cells: [
          <Stack
            key={shape.mark}
            direction="row"
            spacing={1.5}
            sx={{ alignItems: "center", minHeight: 52 }}
          >
            <FigureMark figure={shape.mark} />
            <Typography variant="body2">{shape.name}</Typography>
          </Stack>,
          shape.turns,
          `${shape.tool} / ${shape.ship}`,
          share(total(tools, shape.members)),
          share(total(ships, shape.members)),
        ],
      }))}
    />
  );
}

function Classes() {
  const letters = ["C", "B", "A", "S"] as const;
  return (
    <DataTable
      head={[
        "Class",
        "All tools",
        "Tools we keep",
        "All wrecks",
        "Ships we keep",
      ]}
      rows={letters.map((letter) => ({
        key: letter,
        cells: [
          letter,
          share(euclid.tool_classes[letter]),
          share(euclid.kept_tool_classes[letter]),
          share(euclid.ship_classes[letter]),
          share(euclid.kept_ship_classes[letter]),
        ],
      }))}
    />
  );
}

function Hulls() {
  const all = euclid.ship_hulls as Record<string, number>;
  const kept = euclid.kept_ship_hulls as Record<string, number>;
  return (
    <DataTable
      head={["Hull", "All wrecks", "We keep"]}
      rows={Object.entries(all)
        .sort((one, other) => other[1] - one[1])
        .map(([hull, value]) => ({
          key: hull,
          cells: [
            <FormattedMessage key={hull} id={`hull.${hull}`} />,
            share(value),
            share(kept[hull] ?? 0),
          ],
        }))}
    />
  );
}

function Histogram() {
  return (
    <DataTable
      head={["Items kept", "Systems, by tools", "Systems, by ships"]}
      rows={histogramRows().map((row) => ({
        key: row.label,
        cells: [row.label, share(row.tools), share(row.ships)],
      }))}
    />
  );
}

function Galaxies() {
  const all = [stats.euclid, ...stats.galaxies];
  return (
    <DataTable
      head={[
        "Galaxy",
        "Stars per voxel",
        "Tools per system",
        "Ships per system",
      ]}
      rows={all.map((galaxy) => ({
        key: galaxy.name,
        cells: [
          <>
            {galaxy.name.replace(" Galaxy", "")}
            {" ("}
            <FormattedMessage id={`galaxyType.${galaxy.type}`} />
            {")"}
          </>,
          amount(galaxy.stars_per_region),
          amount(stepOf(galaxy.tools, "kept")),
          amount(stepOf(galaxy.ships, "kept")),
        ],
      }))}
    />
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

// The rendered about.md, cut at its widget marks.
function Prose(props: { html: string }) {
  return (
    <Box
      dangerouslySetInnerHTML={{ __html: props.html }}
      sx={{
        "& h1": { typography: "h4", mt: 0, mb: 2 },
        "& h2": { typography: "h5", mt: 3, mb: 1 },
        "& p, & li": { typography: "body1" },
        "& p": { mt: 0, mb: 2 },
        "& ul, & ol": { mt: 0, mb: 2, pl: 3 },
        "& li": { mb: 0.5 },
        "& a": { color: "primary.main" },
      }}
    />
  );
}

export function AboutScreen(props: { html: string }) {
  const parts = props.html.split(/<!-- widget:(\w+) -->/);
  return (
    <Stack component="article" spacing={2.5} sx={{ maxWidth: 760, pb: 2 }}>
      {parts.map((part, index) => {
        if (index % 2 === 0) {
          return part.trim() ? <Prose key={index} html={part} /> : null;
        }
        const Widget = WIDGETS[part];
        return Widget ? <Widget key={index} /> : null;
      })}
    </Stack>
  );
}
