import { readFile } from "node:fs/promises";
import path from "node:path";

import { marked } from "marked";

import { livingText } from "@/lib/archive/features";
import { longGuideLinks, questionOf } from "@/lib/archive/guides";

// Long text lives in content/LOCALE/NAME.md, not in the message files. These
// files are ours, so the HTML is rendered as is.
export async function readContent(name: string, locale = "en") {
  const file = path.join(process.cwd(), "content", locale, `${name}.md`);
  return anchorHeadings(
    await marked.parse(
      longGuideLinks(livingText(await readFile(file, "utf8"))),
    ),
  );
}

// A section heading gets an id from its words, so a page can link to it.
function anchorHeadings(html: string) {
  return html.replace(/<h2>(.*?)<\/h2>/g, (_, inner: string) => {
    const id = inner
      .replace(/<[^>]+>/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return `<h2 id="${id}">${inner}</h2>`;
  });
}

// The bold question that opens each guide, by its slug, for the lists of the
// guides.
export async function guideQuestions(slugs: string[], locale = "en") {
  const entries = await Promise.all(
    slugs.map(async (slug) => {
      const file = path.join(
        process.cwd(),
        "content",
        locale,
        "statistics",
        `${slug}.md`,
      );
      return [slug, questionOf(await readFile(file, "utf8"))] as const;
    }),
  );
  return Object.fromEntries(entries);
}
