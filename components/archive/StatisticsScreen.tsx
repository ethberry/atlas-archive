"use client";

import Link from "next/link";
import MuiLink from "@mui/material/Link";
import Box from "@mui/material/Box";
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
import { groupPath, guidePath } from "@/lib/archive/guides";
import type { StatTable, Topic } from "@/lib/archive/statistics";
import type { ChartSpec } from "@/lib/archive/chart-spec";

const TILE = 44;

// A module's picture from the game, then its name: one tile of the page's
// sprite, framed as an inventory slot. A row with no picture keeps the room,
// so the names stay in one column.
function iconCell(
  cell: string,
  tile: number | null | undefined,
  sprite: { src: string; columns: number },
) {
  return (
    <Stack
      key="icon"
      direction="row"
      spacing={1.5}
      sx={{ alignItems: "center", minHeight: 52 }}
    >
      {tile === null || tile === undefined ? (
        <Box sx={{ width: TILE + 4, height: TILE + 4, flexShrink: 0 }} />
      ) : (
        <Box
          role="img"
          aria-hidden
          sx={{
            width: TILE,
            height: TILE,
            flexShrink: 0,
            boxSizing: "content-box",
            border: "2px solid #fff",
            boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.35)",
            backgroundImage: `url(${sprite.src})`,
            backgroundSize: `${sprite.columns * TILE}px auto`,
            backgroundPosition: `-${(tile % sprite.columns) * TILE}px -${Math.floor(tile / sprite.columns) * TILE}px`,
          }}
        />
      )}
      <Typography variant="body2">{cell}</Typography>
    </Stack>
  );
}

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
                  <CellMark
                    cells={table.marks[index]}
                    accent={table.accents?.[index]}
                  />
                  {row[0] ? (
                    <Typography variant="body2">{row[0]}</Typography>
                  ) : null}
                </Stack>,
                ...row.slice(1),
              ]
            : table.icons && table.sprite
              ? [
                  iconCell(row[0], table.icons[index], table.sprite),
                  ...row.slice(1),
                ]
              : table.head[0] === "Galaxy"
                ? [galaxyCell(row[0]), ...row.slice(1)]
                : row,
        }))}
      />
      {noted && table.note ? <TableNote note={table.note} /> : null}
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

// The guides of each group with the question and the short answer of each.
// The guides page lists every group under a link to the group's own page; a
// group's page lists its own guides alone, under its title. A section outside
// the guides (Quests) passes its own title and pages, each with its path.
export function TopicList(props: {
  topics: Topic[];
  questions: Record<string, string | undefined>;
  group?: string;
  section?: {
    title: string;
    pages: { slug: string; title: string; href: string }[];
  };
}) {
  const factOf = new Map(props.topics.map((row) => [row.slug, row.fact]));
  const groups = props.section
    ? [{ slug: "", ...props.section }]
    : statisticsMenu
        .filter((group) => !props.group || group.slug === props.group)
        .map((group) => ({
          ...group,
          pages: group.pages.map((page) => ({
            ...page,
            href: guidePath(page.slug),
          })),
        }));
  const own = Boolean(props.group || props.section);
  return (
    <Stack spacing={3} sx={{ maxWidth: 760 }}>
      {groups.map((group) => (
        <Stack key={group.slug || group.title} spacing={1.5}>
          {own ? (
            <Typography variant="h3" component="h1">
              {group.title}
            </Typography>
          ) : (
            <MuiLink
              component={Link}
              href={groupPath(group.slug)}
              variant="h4"
              underline="hover"
              color="text.primary"
            >
              {group.title}
            </MuiLink>
          )}
          <Stack component="ul" spacing={2} sx={{ p: 0, m: 0 }}>
            {group.pages.map((page) => (
              <Stack key={page.slug} component="li" sx={{ listStyle: "none" }}>
                <MuiLink component={Link} href={page.href} variant="h6">
                  {page.title}
                </MuiLink>
                {props.questions[page.slug] && (
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {props.questions[page.slug]}
                  </Typography>
                )}
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
