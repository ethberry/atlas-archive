# Search: the semantic core and the links

How Atlas Archive is built for search, set on 2026-11-03 before release 1.1. Read this before a review of the site's
text, and change it here when a rule changes, so the next review checks against it instead of starting over.

## The one question

The site answers one question: **how to get the best item in No Man's Sky.** Every page is a cut of it, first by item
(multitool, ship, freighter, frigate, creature, upgrade module), then by where (galaxy, system, station, planet). A page
that answers no part of that question does not belong on the site.

## Sections

| Section      | Path                                                                                                              | What it is                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| How it works | `/about`                                                                                                          | the method, as a funnel from the galaxy down to the one square on show                         |
| Catalog      | `/galaxy`, `/system`, `/planet`, `/ship`, `/tool`, `/creature`, and a page a record                               | finds with their portal glyphs                                                                 |
| Guides       | `/guides`, `/guides/<slug>`                                                                                       | one question a page, with the numbers as proof; built by `conveyor pages` in crimson-orb       |
| Tools        | `/interceptor-finder`, `/capital-freighter-finder`, `/freighter-finder`, `/living-ship-finder`, `/how-lucky-am-i` | finders give a system; the freighter and living ship pages are builders that give a shape only |

**Hidden finders.** `FINDERS_ENABLED` in `lib/archive/features.ts` is false (the owner, 2026-11-05): `/interceptor-finder`, `/capital-freighter-finder`, and `/freighter-finder` answer 404 and leave Tools, the menu, the footer, and the sitemap, so How lucky am I? is the one tool. In the Markdown a link to them renders as plain words, and `<!-- finders -->…<!-- /finders -->` (with `not-finders` for the other way) holds each sentence about them. A rich message that names them has a `…Finders` twin in `lib/i18n/en.json` (`homeLeadFinders`, `kindLead.shipFinders`, `tourToolsFinders`), shown while the flag is on, and the Interceptor note on a ship page drops `noteFinder`. Setting the flag to true brings it all back.

**Hidden until 3.0.** Living ships and organic frigates wait for version 3.0. `LIVING_SHIPS_ENABLED` in
`lib/archive/features.ts` is false: the `living-ships` and `organic-frigates` guides and `/living-ship-finder` answer
404, and every link to them leaves the menu, the footer, Tools, the sitemap, and the text of other pages. In the
Markdown, a link to a hidden page renders as its plain words, `<!-- living -->…<!-- /living -->` shows only with the
flag on, and `<!-- not-living -->…<!-- /not-living -->` only with it off (the sentence that leads to the next guide
instead). Files and data stay; setting the flag to true brings every page and link back. The rows of these pages
below stay for 3.0.

The Guides were Statistics and the Catalog was the Encyclopedia until 2026-11-03. `/statistics` and
`/statistics/<slug>` redirect permanently to `/guides` (`next.config.ts`). The code keeps the old names
(`statistics.json`, `content/en/statistics/`, `StatisticsScreen`); only what a visitor reads changed.

## Titles, headings, descriptions

- Every page has one `<h1>`. Catalog lists and records render it in `CatalogScreen` and `AssetCard`, the home page in
  `HomeScreen`, a guide from the `#` line of its text.
- A guide's `<title>` is `<title> in No Man's Sky — Atlas Archive`, or its question for the pages worth the most
  (`TITLES` in `app/guides/[slug]/page.tsx`); its description is
  the page's `fact` from crimson-orb `generator/store/src/pages/*.rs`, which leads with the answer.
- A tool's `<title>` names No Man's Sky and the thing found, e.g. "No Man's Sky Interceptor finder: find a Sentinel
  Interceptor by its parts and colour".
- Each page opens with its question in bold, in the words a player types, and answers it in the first sentences.
- A menu label equals the `<h1>` of the page it opens.
- No page links to itself in its own text; the site-wide header and footer are the only exception.

## Spelling and terms

- **multitool**, one word, everywhere in site text; "Multi-Tool" only when a game item name is quoted.
- Terms as in the game or the community: class S, supercharged slots, crashed ship, Sentinel Interceptor, capital
  freighter, dreadnought, living ship, Void Egg, organic frigate, Dream Aerial, upgrade module, portal glyphs.
- Never on the site: generator, seed, code; sample sizes, counts of systems, "none of N". Guides name no system or
  coordinates, with one exception: the players' farm table on `freighter-modules`.

## The semantic core

Primary and secondary queries by page. The order is judgement, not measured search volume. The pages worth the most:
multitool-classes, ship-classes, freighters, interceptors, living-ships, station-upgrades, staffs, multitool-upgrades,
ship-upgrades, organic-frigates, how-lucky-am-i.

| Page                                                               | Primary query                                                                             | Secondary                                                              |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `/`                                                                | best items no man's sky                                                                   | where to find S-class multitool; crashed ship locations; portal glyphs |
| `/about`                                                           | how supercharged slots work                                                               | adjacent supercharged slots; multitool sources                         |
| `/guides`                                                          | no man's sky guides                                                                       | where to find class S; farming guide                                   |
| `/tool`                                                            | multitools with adjacent supercharged slots (not "S-class": most listed tools are A or B) | multitool glyphs; staff locations                                      |
| `/ship`                                                            | crashed ships with adjacent supercharged slots                                            | S-class crashed ship; exotic crashed ship; Sentinel Interceptor wreck  |
| `/creature`                                                        | best creature to adopt                                                                    | all-S creature; companion stats                                        |
| `/interceptor-finder`                                              | Sentinel Interceptor locations                                                            | Interceptor glyphs; crashed Sentinel ship                              |
| `/capital-freighter-finder`                                        | capital freighter locations                                                               | best capital freighter; freighter battle system                        |
| `/freighter-finder`                                                | freighter shapes                                                                          | regular freighter; freighter parts                                     |
| `/living-ship-finder`                                              | living ship parts                                                                         | living ship types; Void Egg ship shapes                                |
| `/how-lucky-am-i`                                                  | multitool rating                                                                          | is my multitool good; ship stats calculator; best staff stats          |
| galaxies                                                           | best galaxy                                                                               | harsh, lush galaxy; galaxy types                                       |
| where-to-look                                                      | where to find multitools                                                                  | galaxy core or rim; uncharted systems                                  |
| systems                                                            | star system types                                                                         | star colour; how many planets                                          |
| economy                                                            | wealthy system                                                                            | economy and class S; pirate system                                     |
| races                                                              | Gek, Korvax, Vy'keen systems                                                              | Atlantid multitool; race and ship type                                 |
| space-stations                                                     | space station merchants                                                                   | technology merchant; pirate station; abandoned station                 |
| station-upgrades                                                   | S-class upgrade modules                                                                   | where to buy S modules; station stock                                  |
| freighters                                                         | S-class capital freighter                                                                 | free capital freighter; freighter battle                               |
| dreadnoughts                                                       | pirate dreadnought                                                                        | seize a dreadnought                                                    |
| freighter-modules                                                  | S-class freighter modules farm                                                            | dreadnought modules; hyperdrive module                                 |
| frigates                                                           | S-class frigate                                                                           | frigate traits; frigate levels; Raider                                 |
| organic-frigates                                                   | organic frigate                                                                           | Dream Aerial; cosmic whale; dream answers                              |
| sentinel-capital-ship                                              | Sentinel capital ship                                                                     | Carrier AI Fragment; wanted level 5                                    |
| sources-by-size, sources-by-type, empty-worlds                     | best planet for multitools and wrecks                                                     | planet size; biome; sea level                                          |
| sentinels-and-dissonance                                           | dissonant planet                                                                          | dissonance resonator; corrupted Sentinels                              |
| multitool-types                                                    | multitool types                                                                           | Royal, Sentinel, Atlantid, Alien, staff                                |
| multitool-classes                                                  | S-class multitool                                                                         | class by wealth                                                        |
| multitool-stats                                                    | best multitool stats                                                                      | max damage; scanner                                                    |
| multitool-upgrades                                                 | upgrade multitool to S                                                                    | upgrade or find at S                                                   |
| figures, square                                                    | adjacent supercharged slots                                                               | 2×2 square; slot layouts                                               |
| staffs                                                             | best staff head                                                                           | Autophage staff; staff terminal                                        |
| ship-types                                                         | ship types                                                                                | exotic, solar, hauler, fighter, explorer, shuttle                      |
| ship-classes                                                       | S-class crashed ship                                                                      | class by wealth                                                        |
| ship-stats                                                         | best ship stats                                                                           | max hyperdrive; damage; shield                                         |
| ship-upgrades                                                      | upgrade ship to S                                                                         | do upgrades change stats; ship supercharged slots                      |
| ship-figures, ship-square                                          | ship supercharged slots                                                                   | adjacent; square                                                       |
| interceptors                                                       | how to get a Sentinel Interceptor                                                         | Interceptor class S; dissonant planet                                  |
| living-ships                                                       | how to get a living ship                                                                  | Void Egg; living ship quest                                            |
| creature-roles, creature-grades, creature-stats, creature-affinity | all-S creature                                                                            | companion; Trait Potential; affinity                                   |

## The links

- **Rules.** Links stand inside sentences; the anchor text appears on the target page (its `<h1>`, lead, or title); no
  "See also" or "See more" rows; no links to Reddit (they leak rank); external links only where a page cites a rule
  (Google's data policy on the privacy page).
- **Menus.** Header items are real links (`ArchiveBar.tsx`); the drawer is the same list on a phone.
- **Footer.** `ArchiveShell.tsx`: four columns, the legal pages first, then the Catalog lists, one link a group of
  guides (to the group's first page), and the tools from `lib/archive/tools.ts`. It does not repeat the whole menu.
- **Guides.** Each guide ends with a sentence leading to the next one in the menu order, and links in its text to the
  guides it relies on, to the tool that acts on it, and to the catalog list it describes. Every guide is reached from at
  least two other pages.
- **Tools and guides.** Interceptor finder ↔ interceptors, ship-classes, ship-square; capital freighter finder ↔
  freighters, dreadnoughts, freighter-modules; freighter finder ↔ freighters, frigates; living ship finder ↔
  living-ships, organic-frigates; How lucky am I? ↔ multitool-classes, multitool-stats, staffs, figures, ship-stats,
  ship-upgrades, ship-figures.
- **Records.** `RecordNote.tsx` adds one or two sentences under a card, each to a guide or tool the card links nowhere else: a tool or ship below S leads to its upgrade guide, every tool and ship to How lucky am I?, a staff to staffs, an Interceptor to its guide and finder. The class guides are not among them: the card's Class row already links there (2026-11-04). The card's own rows link their guides (`lib/archive/explain.ts`): each base stat row leads to its section of the stats guide, `multitool-stats#damage`, `#mining`, `#scanner`, and `ship-stats#damage`, `#shield`, `#hyperdrive`, `#maneuverability`; a tool card shows Base mining as the base percent, 0% for a rifle, since the game's card has no mining figure and the Mining Beam's own speed is not read; Base damage and Base scanner are the card's absolute figures, a pistol's damage being the bare beam's 333.3 (the owner, 2026-11-04). The card's values link too: Object to the catalog list of its kind (`/tool`, `/ship`, …), and Galaxy, System, and Planet to their pages, as the breadcrumbs do; the row of the record itself stays plain.

## How to review before a release

1. Read the served HTML, not the source: `curl -s localhost:3000/<path>` shows what a crawler gets (the `<title>`, the
   `<h1>`, the links). A link that only a click on a menu opens does not count.
2. Check each page against its row in the core: the primary query in the title, the lead, and the description.
3. Check links against the rules above: count the incoming links of each guide and tool; none should have fewer than
   two from text.
4. Check the text rules: the forbidden words, sample sizes, places on guides, and that every claim is proven in
   crimson-orb `docs` or said to be not researched yet.
5. Change this file when a rule changes; add a page's row when a page is added.
