import { colorOf, isNamed } from "@/lib/archive/chart-colors";

// What a chart draws. A page builds it, the browser only draws.
export type ChartSeries = {
  label: string;
  values: (number | null)[];
  color: string;
  // What a tooltip prints for each point.
  exact?: string[];
  // A range chart: where each row runs, on this series' own scale.
  spans?: ([number, number] | null)[];
};

export type ChartSpec = {
  kind: "line" | "stack" | "bars" | "range";
  title: string;
  // Names the chart for a screen reader when it has no title.
  label: string;
  // Under the bottom axis of a line chart.
  axis?: string;
  labels: string[];
  series: ChartSeries[];
  // How the value axis prints. `power` values are powers of ten, for numbers too
  // far apart for one straight scale.
  format: "count" | "share" | "number" | "power" | "roll";
  height: number;
  // A colour per row, for one series of named things.
  rowColors?: string[];
  // Shares drawn on the whole scale, 0 to 100%, where a short one could pass for
  // the most there is.
  whole?: boolean;
};

export const LINE_HEIGHT = 320;
const ROW = 30;
const BAR = 12;
export const PANEL_ROW = 24;
export const PANEL_EXTRA = 62;

export function chartSpec(input: {
  kind: ChartSpec["kind"];
  labels: string[];
  series: Omit<ChartSeries, "color">[];
  format: ChartSpec["format"];
  label: string;
  title?: string;
  axis?: string;
  whole?: boolean;
}): ChartSpec {
  const { kind, labels, series } = input;
  const single = series.length === 1;
  const row = kind === "bars" ? Math.max(ROW, series.length * BAR + 8) : ROW;
  const legend = single ? 0 : 56;
  return {
    ...input,
    title: input.title ?? "",
    series: series.map((row, at) => ({
      ...row,
      color: colorOf(row.label, at),
    })),
    height:
      kind === "line"
        ? LINE_HEIGHT
        : kind === "range"
          ? series.length * (labels.length * PANEL_ROW + PANEL_EXTRA)
          : Math.max(160, labels.length * row + 48 + legend),
    rowColors:
      (single || kind === "range") && labels.every(isNamed)
        ? labels.map((label, at) => colorOf(label, at))
        : undefined,
  };
}
