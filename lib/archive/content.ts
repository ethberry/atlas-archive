import { readFile } from "node:fs/promises";
import path from "node:path";

import { marked } from "marked";

// Long text lives in content/LOCALE/NAME.md, not in the message files. These
// files are ours, so the HTML is rendered as is.
export async function readContent(name: string, locale = "en") {
  const file = path.join(process.cwd(), "content", locale, `${name}.md`);
  return marked.parse(await readFile(file, "utf8"));
}
