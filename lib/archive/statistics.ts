import { itemNumbers, itemTables } from "@/lib/archive/item-tables";
import {
  printCell,
  printValue,
  type RawTable,
  type Value,
} from "@/lib/archive/statistics-format";
import data from "@/lib/archive/statistics.json";
import { guideShown } from "@/lib/archive/features";

// A table as the page prints it.
export type StatTable = {
  head: string[];
  rows: string[][];
  note: string;
  marks?: [number, number][][];
  upright?: boolean;
  // How many columns from the start hold words.
  text?: number;
};

export type Topic = { slug: string; title: string; fact: string };

type Page = {
  title: string;
  fact: Value;
  numbers: Record<string, Value>;
  tables: Record<string, RawTable>;
};

const pages = data.pages as unknown as Record<string, Page>;

// The pages in reading order. A page missing from the data stays out, and so
// does a guide the feature flag hides.
export const TOPICS: Topic[] = data.order.filter(guideShown).map((slug) => ({
  slug,
  title: pages[slug].title,
  fact: printValue(pages[slug].fact),
}));

export function topicOf(slug: string) {
  return TOPICS.find((topic) => topic.slug === slug);
}

function printed(table: RawTable): StatTable {
  const { head, kinds, rows, note, marks, upright, text } = table;
  return {
    head,
    note,
    rows: rows.map((row) =>
      row.map((cell, at) => printCell(cell, kinds?.[at] ?? "text")),
    ),
    ...(marks ? { marks } : {}),
    ...(upright ? { upright } : {}),
    ...(text ? { text } : {}),
  };
}

export function tablesOf(slug: string) {
  const tables = Object.entries(pages[slug].tables).map(
    ([name, table]) => [name, printed(table)] as const,
  );
  return { ...Object.fromEntries(tables), ...itemTables(slug) };
}

// The numbers of a table, for a chart.
export function rawTableOf(slug: string, name: string) {
  return pages[slug].tables[name];
}

function printedNumbers(slug: string) {
  const page = pages[slug];
  const numbers = (page?.numbers ?? data.numbers) as Record<string, Value>;
  const out: Record<string, string> = {};
  for (const [name, value] of Object.entries(numbers)) {
    out[name] = printValue(value);
  }
  return page ? { ...out, ...itemNumbers(slug) } : out;
}

// Writes the numbers into the rendered text; a name it does not know stays
// visible, so a typo in a page shows.
export function fillStatistics(html: string, slug: string) {
  const values = printedNumbers(slug);
  return html.replace(/\{\{(\w+)\}\}/g, (found, name: string) =>
    name in values ? values[name] : found,
  );
}
