"use client";

import Link from "next/link";
import MuiLink from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import {
  Article,
  CellMark,
  DataTable,
  GalaxyLink,
} from "@/components/archive/Article";
import { ChartBlock } from "@/components/archive/ChartBlock";
import { SentinelMeme } from "@/components/archive/SentinelMeme";
import {
  DreadnoughtCannons,
  DreadnoughtEngines,
  DreadnoughtRender,
  DreadnoughtShields,
  SentinelRender,
  SentinelShields,
} from "@/components/archive/ShipRender";
import { GUIDE_MENU as statisticsMenu } from "@/lib/archive/features";
import type { StatTable, Topic } from "@/lib/archive/statistics";
import type { ChartSpec } from "@/lib/archive/chart-spec";

function galaxyCell(cell: string) {
  const [name, ...rest] = cell.split(" ");
  return (
    <>
      <GalaxyLink name={name} /> {rest.join(" ")}
    </>
  );
}

function TableNote(props: { note: string }) {
  return (
    <Typography variant="caption" color="text.secondary">
      {props.note}
    </Typography>
  );
}

// `noted` false leaves the note to the caller: under a chart it stands below
// the Chart and Table switch, so both views show it.
function StatisticsTable(props: { table: StatTable; noted?: boolean }) {
  const { table, noted = true } = props;
  return (
    <Stack spacing={0.75}>
      <DataTable
        head={table.head}
        upright={table.upright}
        textColumns={table.text}
        rows={table.rows.map((row, index) => ({
          key: `${index}.${row[0]}`,
          cells: table.marks
            ? [
                <Stack
                  key="mark"
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: "center", minHeight: 52 }}
                >
                  <CellMark cells={table.marks[index]} />
                  {row[0] ? (
                    <Typography variant="body2">{row[0]}</Typography>
                  ) : null}
                </Stack>,
                ...row.slice(1),
              ]
            : table.head[0] === "Galaxy"
              ? [galaxyCell(row[0]), ...row.slice(1)]
              : row,
        }))}
      />
      {noted ? <TableNote note={table.note} /> : null}
    </Stack>
  );
}

// Pictures a page's text may place besides its tables.
const PICTURES = {
  meme: SentinelMeme,
  dreadnoughtRender: DreadnoughtRender,
  dreadnoughtShields: DreadnoughtShields,
  dreadnoughtEngines: DreadnoughtEngines,
  dreadnoughtCannons: DreadnoughtCannons,
  sentinelRender: SentinelRender,
  sentinelShields: SentinelShields,
};

function widgetsOf(
  tables: Record<string, StatTable>,
  charts: Record<string, ChartSpec>,
) {
  return Object.fromEntries([
    ...Object.entries(PICTURES),
    ...Object.entries(tables).map(([name, table]) => [
      name,
      function Widget() {
        const spec = charts[name];
        return spec ? (
          <Stack spacing={0.75}>
            <ChartBlock spec={spec}>
              <StatisticsTable table={table} noted={false} />
            </ChartBlock>
            <TableNote note={table.note} />
          </Stack>
        ) : (
          <StatisticsTable table={table} />
        );
      },
    ]),
  ]);
}

export function TopicScreen(props: {
  html: string;
  tables: Record<string, StatTable>;
  charts: Record<string, ChartSpec>;
}) {
  return (
    <Article
      html={props.html}
      widgets={widgetsOf(props.tables, props.charts)}
    />
  );
}

export function TopicList(props: { topics: Topic[] }) {
  const factOf = new Map(props.topics.map((row) => [row.slug, row.fact]));
  return (
    <Stack spacing={3} sx={{ maxWidth: 760 }}>
      {statisticsMenu.map((group) => (
        <Stack key={group.title} spacing={1.5}>
          <Typography variant="h4">{group.title}</Typography>
          <Stack component="ul" spacing={2} sx={{ p: 0, m: 0 }}>
            {group.pages.map((page) => (
              <Stack key={page.slug} component="li" sx={{ listStyle: "none" }}>
                <MuiLink
                  component={Link}
                  href={`/guides/${page.slug}`}
                  variant="h6"
                >
                  {page.title}
                </MuiLink>
                <Typography variant="body2" color="text.secondary">
                  {factOf.get(page.slug)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
