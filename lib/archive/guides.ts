import statisticsMenu from "@/lib/archive/statistics-menu.json";

// Each group of the guides menu is a page of its own at /guides/<group>, and
// its guides sit under it at /guides/<group>/<slug> (the owner, 2026-11-05).
// The text of the pages keeps the short /guides/<slug> links; they are made
// long here, so a guide that moves to another group needs no edit of the text.

export type GuideGroup = (typeof statisticsMenu)[number];

const GROUP_OF = new Map(
  statisticsMenu.flatMap((group) =>
    group.pages.map((page) => [page.slug, group] as const),
  ),
);

export function groupOfGuide(slug: string) {
  return GROUP_OF.get(slug);
}

export function groupBySlug(slug: string) {
  return statisticsMenu.find((group) => group.slug === slug);
}

export function groupPath(group: string) {
  return `/guides/${group}`;
}

export function guidePath(slug: string) {
  const group = GROUP_OF.get(slug);
  return group ? `/guides/${group.slug}/${slug}` : `/guides/${slug}`;
}

// The guide a path names, short or long, with any `#section` or `?query` left
// out: `/guides/ships/ship-types#x` and `/guides/ship-types` both give
// `ship-types`. A group's own page names no guide, except where a group and its
// first guide share a word: there the short link, as the text writes it, is the
// guide.
export function guideOfPath(href: string) {
  const parts = href.split(/[?#]/)[0].split("/").filter(Boolean);
  const slug = parts.at(-1) ?? "";
  if (parts[0] !== "guides" || !GROUP_OF.has(slug)) {
    return undefined;
  }
  if (parts.length === 2) {
    return slug;
  }
  return parts.length === 3 && GROUP_OF.get(slug)?.slug === parts[1]
    ? slug
    : undefined;
}

// Every short guide link of a Markdown text made long, its section kept.
export function longGuideLinks(markdown: string) {
  return markdown.replace(
    /\]\(\/guides\/([a-z0-9-]+)([#?][^)\s]*)?\)/g,
    (link, slug: string, rest: string | undefined) =>
      GROUP_OF.has(slug) ? `](${guidePath(slug)}${rest ?? ""})` : link,
  );
}

// The bold question that opens a guide, `**Which galaxy is best?**`.
export function questionOf(markdown: string) {
  return markdown.match(/^\*\*([^*]+\?)\*\*/m)?.[1];
}

// Quests is a section of its own beside the Guides (the owner, 2026-11-08): its
// contents page at /quests and each quest at /quests/<slug>. The paths stand
// here, beside the guides' paths, so the header and the footer reach them
// without the pages' data.
export const QUESTS_PATH = "/quests";

export function questPath(slug: string) {
  return `${QUESTS_PATH}/${slug}`;
}
