import statisticsMenu from "@/lib/archive/statistics-menu.json";

// Living ships and organic frigates are hidden until 3.0 (crimson-orb
// docs/plan.md, Version 3.0). With the flag off their guides and the living
// ship builder do not render, and every link to them leaves the menu, the
// footer, Tools, the sitemap, and the text of other pages; their files and data
// stay. Set it to true to bring all of it back (docs/seo.md).
export const LIVING_SHIPS_ENABLED = false;

// The finders are hidden too (the owner, 2026-11-05): every tool but How lucky
// am I? With the flag off their pages answer 404 and every link to them leaves
// the menu, the footer, Tools, the sitemap, and the text of the pages.
export const FINDERS_ENABLED = false;

// The guides and the tool the flag hides.
const LIVING_GUIDES = ["living-ships", "organic-frigates"];
const LIVING_PATHS = [
  "/living-ship-finder",
  ...LIVING_GUIDES.map((slug) => `/guides/${slug}`),
];
const FINDER_PATHS = [
  "/interceptor-finder",
  "/capital-freighter-finder",
  "/freighter-finder",
];

export function guideShown(slug: string) {
  return LIVING_SHIPS_ENABLED || !LIVING_GUIDES.includes(slug);
}

// False for a link whose page a flag hides; `#section` and `?query` count.
export function pathShown(href: string) {
  const bare = href.split(/[?#]/)[0];
  if (!FINDERS_ENABLED && FINDER_PATHS.includes(bare)) {
    return false;
  }
  return LIVING_SHIPS_ENABLED || !LIVING_PATHS.includes(bare);
}

// The guides menu without the hidden guides, and without a group left empty.
export const GUIDE_MENU = statisticsMenu
  .map((group) => ({
    ...group,
    pages: group.pages.filter((page) => guideShown(page.slug)),
  }))
  .filter((group) => group.pages.length > 0);

// A page's text with the flags applied: `<!-- living -->…<!-- /living -->` stays
// only while the flag is on, `<!-- not-living -->…<!-- /not-living -->` only
// while it is off, `finders` and `not-finders` the same for the finders, and a
// link to a hidden page becomes its plain words.
export function livingText(markdown: string) {
  const keep = (name: string, shown: boolean) => (text: string) =>
    text.replace(
      new RegExp(`<!-- ${name} -->([\\s\\S]*?)<!-- /${name} -->`, "g"),
      (_, inner: string) => (shown ? inner : ""),
    );
  const blocks = [
    keep("living", LIVING_SHIPS_ENABLED),
    keep("not-living", !LIVING_SHIPS_ENABLED),
    keep("finders", FINDERS_ENABLED),
    keep("not-finders", !FINDERS_ENABLED),
  ].reduce((text, step) => step(text), markdown);
  return blocks.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (link, words: string, href: string) => (pathShown(href) ? link : words),
  );
}
