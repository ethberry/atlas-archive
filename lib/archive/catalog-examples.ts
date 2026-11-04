import "server-only";

import { createClient } from "@supabase/supabase-js";

import { supabasePublishableKey, supabaseUrl } from "@/lib/db/env";
import type { Database } from "@/lib/db/supabase.types";

// One item of each type from the catalog, the highest class first, so a guide
// links to items that exist whatever the showcase holds. `{{catalogTools}}` and
// `{{catalogShips}}` in a guide's text become the sentence.
const TOOL_WORDS: [string, string][] = [
  ["pistol", "a pistol"],
  ["rifle", "a rifle"],
  ["atlantid", "an Atlantid"],
  ["sentinel", "a Sentinel"],
  ["experimental", "an Experimental"],
  ["alien", "an Alien"],
  ["royal", "a Royal"],
];

const SHIP_WORDS: [string, string][] = [
  ["shuttle", "a Shuttle"],
  ["fighter", "a Fighter"],
  ["hauler", "a Hauler"],
  ["explorer", "an Explorer"],
  ["solar", "a Solar"],
  ["interceptor", "an Interceptor"],
  ["exotic", "an Exotic"],
];

const CLASS_ORDER = ["S", "A", "B", "C"];

type Row = {
  id: string;
  name: string;
  kind: string;
  word: string;
  rank: number;
};

function escaped(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// "X is a pistol, Y a rifle, …, and Z a Royal", each name a link.
function sentence(rows: Row[], words: [string, string][]) {
  const parts = words.flatMap(([word, phrase]) => {
    const best = rows
      .filter((row) => row.word === word)
      .sort(
        (one, other) =>
          one.rank - other.rank || one.name.localeCompare(other.name),
      )[0];
    return best
      ? [
          `<a href="/${best.kind}/${best.id}">${escaped(best.name)}</a> ${phrase}`,
        ]
      : [];
  });
  if (parts.length === 0) {
    return "";
  }
  const [first, ...rest] = parts;
  const head = first.replace(/ (a|an) /, " is $1 ");
  if (rest.length === 0) {
    return head;
  }
  return `${[head, ...rest.slice(0, -1)].join(", ")}, and ${rest[rest.length - 1]}`;
}

async function read() {
  const url = supabaseUrl();
  const key = supabasePublishableKey();
  if (!url || !key) {
    return null;
  }
  const supabase = createClient<Database>(url, key);
  const [tools, ships] = await Promise.all([
    supabase
      .from("assets")
      .select("id, name, tools!inner(body, class)")
      .eq("kind", "tool"),
    supabase
      .from("assets")
      .select("id, name, ships!inner(hull, class)")
      .eq("kind", "ship"),
  ]);
  if (tools.error || ships.error) {
    return null;
  }
  const rank = (letter: string) => CLASS_ORDER.indexOf(letter);
  const toolRows: Row[] = tools.data.map((row) => {
    const tool = Array.isArray(row.tools) ? row.tools[0] : row.tools;
    return {
      id: row.id,
      name: row.name,
      kind: "tool",
      word: tool.body,
      rank: rank(tool.class),
    };
  });
  const shipRows: Row[] = ships.data.map((row) => {
    const ship = Array.isArray(row.ships) ? row.ships[0] : row.ships;
    return {
      id: row.id,
      name: row.name,
      kind: "ship",
      word: ship.hull,
      rank: rank(ship.class),
    };
  });
  return {
    catalogTools: sentence(toolRows, TOOL_WORDS),
    catalogShips: sentence(shipRows, SHIP_WORDS),
  };
}

// Writes the catalog sentences into a guide's rendered text. Without a
// database the token stays visible, as an unknown number does.
export async function fillCatalogExamples(html: string) {
  if (!html.includes("{{catalog")) {
    return html;
  }
  const found = await read();
  if (!found) {
    return html;
  }
  return html.replace(
    /\{\{(catalogTools|catalogShips)\}\}/g,
    (_, name: "catalogTools" | "catalogShips") => found[name],
  );
}
