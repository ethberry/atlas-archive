"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import MuiLink from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import type { ReactNode } from "react";

import { galaxyHref } from "@/lib/archive/galaxies";

type Row = { key: string; cells: ReactNode[] };

// Four cells of an inventory grid, drawn small.
export function CellMark(props: { cells: [number, number][] }) {
  const { cells } = props;
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

export function GalaxyLink(props: { name: string }) {
  const { name } = props;
  const href = galaxyHref(name);
  if (!href) {
    return name;
  }
  return (
    <MuiLink component={Link} href={href}>
      {name}
    </MuiLink>
  );
}

export function DataTable(props: {
  caption?: string;
  head: ReactNode[];
  rows: Row[];
  upright?: boolean;
  // How many columns from the start hold text, not numbers.
  textColumns?: number;
}) {
  const { caption, head, rows, upright, textColumns = 1 } = props;
  return (
    <Card variant="outlined">
      <TableContainer>
        <Table size="small" aria-label={caption ?? String(head[0])}>
          <TableHead>
            <TableRow>
              {head.map((title, index) => (
                <TableCell
                  key={index}
                  align={index < textColumns ? "left" : "right"}
                  sx={
                    upright && index
                      ? {
                          writingMode: "vertical-rl",
                          transform: "rotate(180deg)",
                          whiteSpace: "nowrap",
                          textAlign: "left",
                        }
                      : undefined
                  }
                >
                  {title}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.key}>
                {row.cells.map((cell, index) => (
                  <TableCell
                    key={index}
                    align={index < textColumns ? "left" : "right"}
                  >
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

// Rendered Markdown, cut at its widget marks.
function Prose(props: { html: string }) {
  return (
    <Box
      dangerouslySetInnerHTML={{ __html: props.html }}
      sx={{
        "& h1": { typography: "h4", mt: 0, mb: 2 },
        "& h2": { typography: "h5", mt: 3, mb: 1, scrollMarginTop: 80 },
        "& h3": { typography: "h6", mt: 2, mb: 1 },
        "& p, & li": { typography: "body1" },
        "& p": { mt: 0, mb: 2 },
        "& ul, & ol": { mt: 0, mb: 2, pl: 3 },
        "& li": { mb: 0.5 },
        "& a": { color: "primary.main" },
        "& small": { typography: "body2" },
        "& table": {
          width: "100%",
          mb: 2,
          borderCollapse: "collapse",
          typography: "body2",
        },
        "& th, & td": {
          px: 2,
          py: 1,
          textAlign: "left",
          borderBottom: 1,
          borderColor: "divider",
        },
        "& th": { fontWeight: 500 },
      }}
    />
  );
}

export function Article(props: {
  html: string;
  widgets: Record<string, () => ReactNode>;
}) {
  const parts = props.html.split(/<!-- widget:(\w+) -->/);
  return (
    <Stack component="article" spacing={2.5} sx={{ maxWidth: 760, pb: 2 }}>
      {parts.map((part, index) => {
        if (index % 2 === 0) {
          return part.trim() ? <Prose key={index} html={part} /> : null;
        }
        const Widget = props.widgets[part];
        return Widget ? <Widget key={index} /> : null;
      })}
    </Stack>
  );
}
