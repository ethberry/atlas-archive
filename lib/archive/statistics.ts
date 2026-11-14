import { itemNumbers, itemTables } from "@/lib/archive/item-tables";
import {
  printCell,
  printValue,
  type RawTable,
  type Value,
} from "@/lib/archive/statistics-format";
import data from "@/lib/archive/statistics.json";

// A table as the page prints it.
export type StatTable = {
  head: string[];
  rows: string[][];
  note: string;
  marks?: [number, number][][];
  // One cell of each row's figure drawn apart, such as a weapon's.
  accents?: [number, number][];
  upright?: boolean;
  // How many columns from the start hold words.
  text?: number;
  // Each row's tile in the page's sprite, or null for a row with no picture.
  icons?: (number | null)[];
  // The sprite: a grid of square tiles, `columns` to a row.
  sprite?: { src: string; columns: number };
};

export type Topic = { slug: string; title: string; fact: string };

type Page = {
  title: string;
  fact: Value;
  numbers: Record<string, Value>;
  tables: Record<string, RawTable>;
};

const pages = data.pages as unknown as Record<string, Page>;

// A page of the file by its slug: its title and its fact.
export function pageTopic(slug: string): Topic {
  return {
    slug,
    title: pages[slug].title,
    fact: printValue(pages[slug].fact),
  };
}

// The guides in reading order.
export const TOPICS: Topic[] = data.order.map(pageTopic);

export function topicOf(slug: string) {
  return TOPICS.find((topic) => topic.slug === slug);
}

function printed(table: RawTable): StatTable {
  const {
    head,
    kinds,
    rows,
    note,
    marks,
    accents,
    upright,
    text,
    icons,
    sprite,
  } = table;
  return {
    head,
    note,
    rows: rows.map((row) =>
      row.map((cell, at) => printCell(cell, kinds?.[at] ?? "text")),
    ),
    ...(marks ? { marks } : {}),
    ...(accents ? { accents } : {}),
    ...(upright ? { upright } : {}),
    ...(text ? { text } : {}),
    ...(icons && sprite ? { icons, sprite } : {}),
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
