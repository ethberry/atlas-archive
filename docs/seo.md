# Search: the semantic core and the links

How Atlas Archive is built for search, set on 2026-11-03 before release 1.1: the sections, the semantic core, the
link map, and the review before a release. The rules of the text itself (the one question, titles, words, links) are
`.claude/rules/site-text.md`; change them there.

## Sections

| Section      | Path                                                                                                              | What it is                                                                                                   |
| ------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| How it works | `/about`                                                                                                          | the method, as a funnel from the galaxy down to the one square on show                                       |
| Catalog      | `/galaxy`, `/system`, `/planet`, `/ship`, `/tool`, `/creature`, and a page a record                               | finds with their portal glyphs                                                                               |
| Guides       | `/guides`, `/guides/<group>`, `/guides/<group>/<slug>`                                                            | one question a page, with the numbers as proof; built by `conveyor pages` in crimson-orb                     |
| Tools        | `/interceptor-finder`, `/capital-freighter-finder`, `/freighter-finder`, `/living-ship-finder`, `/how-lucky-am-i` | finders give a system; the Interceptor, freighter, and living ship pages are builders that give a shape only |

**Finder flags.** Each finder has its own flag in `lib/archive/features.ts` (the owner, 2026-11-05): `INTERCEPTOR_FINDER_ENABLED` is false since 2026-11-06 (it was true), `CAPITAL_FREIGHTER_FINDER_ENABLED` and `FREIGHTER_FINDER_ENABLED` are false. A finder whose flag is off answers 404 and leaves Tools, the menu, the footer, and the sitemap. In the Markdown a link to it renders as plain words, and a block named after its path, `<!-- interceptor-finder -->…<!-- /interceptor-finder -->` (with `not-interceptor-finder` for the other way), holds each sentence about it. A rich message that names finders has twins (the Interceptor page is a builder since 2026-11-05, but keeps its URL and flag) in `lib/i18n/en.json`, picked by `FINDER_MESSAGE`: `…Interceptor` names the Interceptor builder alone, `…Finders` it and the capital freighter finder (`homeLead`, `tourTools`); `kindLead.shipFinders` and the ship page's `noteFinder` follow the Interceptor flag.

**Hidden until 3.0.** Living ships and organic frigates wait for version 3.0. `LIVING_SHIPS_ENABLED` in
`lib/archive/features.ts` is false: the `living-ships` and `organic-frigates` guides and `/living-ship-finder` answer
404, and every link to them leaves the menu, the footer, Tools, the sitemap, and the text of other pages. In the
Markdown, a link to a hidden page renders as its plain words, `<!-- living -->…<!-- /living -->` shows only with the
flag on, and `<!-- not-living -->…<!-- /not-living -->` only with it off (the sentence that leads to the next guide
instead). Files and data stay; setting the flag to true brings every page and link back. The rows of these pages
below stay for 3.0.

The corvette module guide has a flag, `CORVETTE_GUIDE_ENABLED`, off until the corvette is checked in the game after the
living ships; `<!-- corvette -->` and `<!-- not-corvette -->` work as the living blocks, so starship-modules leads to
the Roamer while it is off. The other module guides have no flag since 2026-11-06 (the owner).

The Guides were Statistics and the Catalog was the Encyclopedia until 2026-11-03. `/statistics` and
`/statistics/<slug>` redirect permanently to `/guides` (`next.config.ts`). The code keeps the old names
(`statistics.json`, `content/en/statistics/`, `StatisticsScreen`); only what a visitor reads changed.

Since 2026-11-05 each group of the menu is a page of its own, `/guides/<group>` (the group's title in lower case), and
its guides sit under it at `/guides/<group>/<slug>`. A group's page is a contents list: each guide's title, the bold
question its text opens with, and its `fact`; it tells nothing of its own and stands outside the trail of the guides,
so the last guide of a group leads straight to the first of the next. A guide's breadcrumb is Home › Guides › group ›
guide. The text of the pages keeps short `/guides/<slug>` links, and `longGuideLinks` in `lib/archive/guides.ts` makes
them long when a page is read, so a guide moved to another group needs no edit of the text; code builds the paths with
`guidePath` and `groupPath`. `next.config.ts` redirects every old `/guides/<slug>` and `/statistics/<slug>` to the long
path, from the menu file, except `galaxies`, `systems`, and `freighters`: there a group and its first guide share a
word, so the short path is now the group's page, which links to the guide.

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
| `/interceptor-finder`                                              | Sentinel Interceptor builder, Interceptor parts                                           | Interceptor parts; Interceptor colours                                 |
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
| supercharged-slots                                                 | supercharged slots                                                                        | adjacency bonus; best module placement; max multitool damage           |
| roamer-, nomad-, pilgrim-, colossus-modules                        | Roamer modules (and each exocraft's name)                                                 | exocraft upgrades; exocraft slots; Colossus build                      |
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

- **External.** The one external link cites a rule: Google's data policy on the privacy page.
- **Menus.** Header items are real links (`ArchiveBar.tsx`). The word Guides is a link to `/guides` and the arrow beside it opens the menu, where a group's name opens the group's page; there is no All guides item. The drawer is the same list on a phone, an accordion inside the Guides one: each name opens its page, the arrow beside it what lies under it.
- **Footer.** `ArchiveShell.tsx`: four columns, the legal pages first, then the Catalog lists, one link a group of
  guides (to the group's own page), and the tools from `lib/archive/tools.ts`. It does not repeat the whole menu.
- **Tools and guides.** Interceptor builder ↔ interceptors, ship-classes, ship-square; capital freighter finder ↔
  freighters, dreadnoughts, freighter-modules; freighter finder ↔ freighters, frigates; living ship finder ↔
  living-ships, organic-frigates; How lucky am I? ↔ multitool-classes, multitool-stats, staffs, figures, ship-stats,
  ship-upgrades, ship-figures.
- **Records.** `RecordNote.tsx` adds one or two sentences under a card, each to a guide or tool the card links nowhere else: a tool or ship below S leads to its upgrade guide, every tool and ship to How lucky am I?, a staff to staffs, an Interceptor to its guide and finder. The class guides are not among them: the card's Class row already links there (2026-11-04). The card's own rows link their guides (`lib/archive/explain.ts`): each base stat row leads to its section of the stats guide, `multitool-stats#damage`, `#mining`, `#scanner`, and `ship-stats#damage`, `#shield`, `#hyperdrive`, `#maneuverability`; a tool card shows Base mining as the base percent, 0% for a rifle, since the game's card has no mining figure and the Mining Beam's own speed is not read; Base damage and Base scanner are the card's absolute figures, a pistol's damage being the bare beam's 333.3 (the owner, 2026-11-04). The card's values link too: Object to the catalog list of its kind (`/tool`, `/ship`, …), and Galaxy, System, and Planet to their pages, as the breadcrumbs do; the row of the record itself stays plain.

## How to review before a release

1. Read the served HTML, not the source: `curl -s localhost:3000/<path>` shows what a crawler gets (the `<title>`, the
   `<h1>`, the links). A link that only a click on a menu opens does not count.
2. Check each page against its row in the core: the primary query in the title, the lead, and the description.
3. Check links against the link rules (`.claude/rules/site-text.md`): count the incoming links of each guide and tool; none should have fewer than
   two from text.
4. Check the text rules (`.claude/rules/site-text.md`): the forbidden words, sample sizes, places on guides, and that
   every claim is proven.
5. Add a page's row to the core when a page is added.
