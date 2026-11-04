"use client";

import { useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import BarChartIcon from "@mui/icons-material/BarChart";
import GridViewIcon from "@mui/icons-material/GridView";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import type { ChartSpec } from "@/lib/archive/chart-spec";

// Drawn in the browser only, so only a page with a chart loads the library.
const StatisticsChart = dynamic(
  () => import("@/components/archive/StatisticsChart"),
  { ssr: false },
);

// A chart and its table in one place, as a demo and its code. The table stays in
// the HTML, for search and for a reader with no JavaScript.
export function ChartBlock(props: { spec: ChartSpec; children: ReactNode }) {
  const { spec, children } = props;
  const [view, setView] = useState<"chart" | "table">("chart");
  return (
    <Stack spacing={1}>
      <noscript>
        <style>{`.chart-table{display:block!important}.chart-view{display:none}`}</style>
      </noscript>
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: "center", justifyContent: "space-between" }}
      >
        <Typography variant="subtitle2">{spec.title}</Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={view}
          aria-label={spec.title || spec.label}
          data-tour="switch"
          onChange={(_, next) => next && setView(next)}
          sx={{ flexShrink: 0 }}
        >
          <ToggleButton value="chart" aria-label="Chart" sx={{ p: 0.5 }}>
            <Tooltip title="Chart">
              {spec.kind === "line" ? (
                <ShowChartIcon fontSize="small" />
              ) : (
                <BarChartIcon fontSize="small" />
              )}
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="table" aria-label="Table" sx={{ p: 0.5 }}>
            <Tooltip title="Table">
              <GridViewIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      <Box
        className="chart-view"
        role="img"
        aria-label={spec.title || spec.label}
        sx={{
          display: view === "chart" ? "block" : "none",
          minHeight: spec.height,
          minWidth: 0,
        }}
      >
        <StatisticsChart spec={spec} />
      </Box>
      <Box
        className="chart-table"
        sx={{ display: view === "table" ? "block" : "none" }}
      >
        {children}
      </Box>
    </Stack>
  );
}
