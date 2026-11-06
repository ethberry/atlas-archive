import { guideOfPath } from "@/lib/archive/guides";
import statisticsMenu from "@/lib/archive/statistics-menu.json";

// Living ships and organic frigates are hidden until 3.0 (crimson-orb
// docs/plan.md, Version 3.0). With the flag off their guides and the living
// ship builder do not render, and every link to them leaves the menu, the
// footer, Tools, the sitemap, and the text of other pages; their files and data
// stay. Set it to true to bring all of it back (docs/seo.md).
export const LIVING_SHIPS_ENABLED = false;

// One flag per finder (the owner, 2026-11-05), so each comes out when it is
// ready. With its flag off a finder's page answers 404, and every link to it
// leaves the menu, the footer, Tools, the sitemap, and the text of the pages.
// Off until its release (the owner, 2026-11-06).
export const INTERCEPTOR_FINDER_ENABLED = false;
export const CAPITAL_FREIGHTER_FINDER_ENABLED = false;
export const FREIGHTER_FINDER_ENABLED = false;

// Each finder's page, by its flag. Its name, the path without the slash, also
// names its text blocks: `<!-- interceptor-finder -->…<!-- /interceptor-finder -->`
// stays only while the flag is on, `not-interceptor-finder` only while it is off.
const FINDERS: Record<string, boolean> = {
  "/interceptor-finder": INTERCEPTOR_FINDER_ENABLED,
  "/capital-freighter-finder": CAPITAL_FREIGHTER_FINDER_ENABLED,
  "/freighter-finder": FREIGHTER_FINDER_ENABLED,
};

// The ending of a message that names the finders: `Finders` names the
// Interceptor and the capital freighter finders, `Interceptor` the first
// alone, and none of them the message with no finder.
export const FINDER_MESSAGE =
  INTERCEPTOR_FINDER_ENABLED && CAPITAL_FREIGHTER_FINDER_ENABLED
    ? "Finders"
    : INTERCEPTOR_FINDER_ENABLED
      ? "Interceptor"
      : "";

// The guides and the tool the living ship flag hides.
const LIVING_GUIDES = ["living-ships", "organic-frigates"];
const LIVING_PATHS = ["/living-ship-finder", "/living-frigate-finder"];

// The corvette guides have a flag of their own: it waits for the checks of the
// corvette in the game, after the living ships (the owner, 2026-11-05). With it
// off the guide answers 404 and leaves the menu, the sitemap, and every link, as
// the living ship guides do. The other module guides have no flag (the owner,
// 2026-11-06).
export const CORVETTE_GUIDE_ENABLED = false;
const CORVETTE_GUIDES = ["corvettes", "corvette-modules"];

function flaggedGuide(slug: string) {
  return (
    (!LIVING_SHIPS_ENABLED && LIVING_GUIDES.includes(slug)) ||
    (!CORVETTE_GUIDE_ENABLED && CORVETTE_GUIDES.includes(slug))
  );
}

export function guideShown(slug: string) {
  return !flaggedGuide(slug);
}

// False for a link whose page a flag hides; `#section` and `?query` count.
export function pathShown(href: string) {
  const bare = href.split(/[?#]/)[0];
  if (FINDERS[bare] === false) {
    return false;
  }
  const guide = guideOfPath(bare);
  if (guide && flaggedGuide(guide)) {
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
// only while the flag is on (and `corvette` by the corvette flag), `<!-- not-living -->…<!-- /not-living -->` only
// while it is off, each finder's blocks the same by its own flag, and a link
// to a hidden page becomes its plain words.
export function livingText(markdown: string) {
  const keep = (name: string, shown: boolean) => (text: string) =>
    text.replace(
      new RegExp(`<!-- ${name} -->([\\s\\S]*?)<!-- /${name} -->`, "g"),
      (_, inner: string) => (shown ? inner : ""),
    );
  const finderSteps = Object.entries(FINDERS).flatMap(([path, shown]) => [
    keep(path.slice(1), shown),
    keep(`not-${path.slice(1)}`, !shown),
  ]);
  const blocks = [
    keep("living", LIVING_SHIPS_ENABLED),
    keep("not-living", !LIVING_SHIPS_ENABLED),
    keep("corvette", CORVETTE_GUIDE_ENABLED),
    keep("not-corvette", !CORVETTE_GUIDE_ENABLED),
    ...finderSteps,
  ].reduce((text, step) => step(text), markdown);
  return blocks.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (link, words: string, href: string) => (pathShown(href) ? link : words),
  );
}
