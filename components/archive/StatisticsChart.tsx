"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";

import {
  PANEL_EXTRA,
  PANEL_ROW,
  type ChartSeries,
  type ChartSpec,
} from "@/lib/archive/chart-spec";
import { count, share } from "@/lib/archive/statistics-format";

function printer(spec: ChartSpec) {
  return (value: number | null) => {
    if (value === null) {
      return "";
    }
    if (spec.format === "share") {
      return share(value);
    }
    if (spec.format === "power") {
      return count(10 ** value);
    }
    if (spec.format === "roll") {
      return value.toFixed(1);
    }
    return spec.format === "count" ? count(value) : String(value);
  };
}

function seriesOf(spec: ChartSpec) {
  const print = printer(spec);
  return (row: ChartSeries) => ({
    label: row.label || undefined,
    data: row.values,
    color: row.color,
    valueFormatter: (value: number | null, context: { dataIndex: number }) =>
      row.exact?.[context.dataIndex] ?? print(value),
  });
}

function Lines(props: { spec: ChartSpec }) {
  const { spec } = props;
  const print = printer(spec);
  const series = seriesOf(spec);
  return (
    <LineChart
      height={spec.height}
      title={spec.title || spec.label}
      skipAnimation
      margin={{ right: 32 }}
      hideLegend={spec.series.length === 1}
      xAxis={[
        {
          scaleType: "point",
          data: spec.labels,
          label: spec.axis,
          height: spec.axis ? 56 : 32,
        },
      ]}
      yAxis={[{ width: 56, valueFormatter: print }]}
      series={spec.series.map((row) => ({
        ...series(row),
        curve: "linear" as const,
      }))}
    />
  );
}

function Bars(props: { spec: ChartSpec }) {
  const { spec } = props;
  const print = printer(spec);
  const series = seriesOf(spec);
  const whole =
    spec.whole ||
    (spec.kind === "stack" &&
      (spec.format === "share" || spec.format === "roll"));
  return (
    <BarChart
      height={spec.height}
      title={spec.title || spec.label}
      layout="horizontal"
      skipAnimation
      margin={{ right: 32 }}
      hideLegend={spec.series.length === 1}
      yAxis={[
        {
          scaleType: "band",
          data: spec.labels,
          width: 128,
          ...(spec.rowColors
            ? {
                colorMap: {
                  type: "ordinal" as const,
                  values: spec.labels,
                  colors: spec.rowColors,
                },
              }
            : {}),
        },
      ]}
      xAxis={[
        {
          scaleType: "linear" as const,
          height: 32,
          tickNumber: 4,
          ...(whole ? { min: 0, max: 1 } : {}),
          valueFormatter: print,
        },
      ]}
      series={spec.series.map((row) => ({
        ...series(row),
        ...(spec.kind === "stack" ? { stack: "all" } : {}),
      }))}
    />
  );
}

// The narrowest a band draws, as a share of the scale, so a single value shows.
const THINNEST = 0.012;

// One stat of a range chart. The library's free bars have no range, so each bar
// stands on a clear base up to its low end.
function RangePanel(props: { spec: ChartSpec; row: ChartSeries }) {
  const { spec, row } = props;
  const spans = row.spans ?? [];
  const top = Math.max(...spans.map((span) => span?.[1] ?? 0));
  const rows = spec.labels.flatMap((label, at) =>
    spans[at] ? [{ label, at, span: spans[at] }] : [],
  );
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption">{row.label}</Typography>
      <BarChart
        height={spec.labels.length * PANEL_ROW + PANEL_EXTRA - 22}
        layout="horizontal"
        skipAnimation
        hideLegend
        margin={{ right: 32, top: 4 }}
        title={row.label}
        yAxis={[
          {
            scaleType: "band",
            data: rows.map((one) => one.label),
            width: 96,
          },
        ]}
        xAxis={[
          { scaleType: "linear" as const, height: 28, tickNumber: 4, min: 0 },
        ]}
        series={[
          {
            data: rows.map((one) => one.span[0]),
            stack: "all",
            color: "transparent",
            valueFormatter: () => null,
          },
          ...rows.map((one, index) => ({
            label: one.label,
            data: rows.map((_, at) =>
              at === index
                ? Math.max(one.span[1] - one.span[0], top * THINNEST)
                : 0,
            ),
            stack: "all",
            color: spec.rowColors?.[one.at] ?? row.color,
            valueFormatter: (
              _value: number | null,
              context: { dataIndex: number },
            ) =>
              (context.dataIndex === index ? row.exact?.[one.at] : null) ??
              null,
          })),
        ]}
      />
    </Box>
  );
}

function Ranges(props: { spec: ChartSpec }) {
  const { spec } = props;
  return spec.series.map((row) => (
    <RangePanel key={row.label} spec={spec} row={row} />
  ));
}

export default function StatisticsChart(props: { spec: ChartSpec }) {
  const { spec } = props;
  if (spec.kind === "range") {
    return <Ranges spec={spec} />;
  }
  return spec.kind === "line" ? <Lines spec={spec} /> : <Bars spec={spec} />;
}
