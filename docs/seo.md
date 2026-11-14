# Search: the semantic core and the links

How Atlas Archive is built for search, set on 2026-11-03 before release 1.1: the sections, the semantic core, the
link map, and the review before a release. The rules of the text itself (the one question, titles, words, links) are
`.claude/rules/site-text.md`; change them there.

## Sections

| Section      | Path                                                                                                              | What it is                                                                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| How it works | `/about`                                                                                                          | the method, as a funnel from the galaxy down to the one square on show                                                                         |
| Catalog      | `/galaxy`, `/system`, `/planet`, `/ship`, `/tool`, `/creature`, and a page a record                               | finds with their portal glyphs                                                                                                                 |
| Guides       | `/guides`, `/guides/<group>`, `/guides/<group>/<slug>`                                                            | one question a page, with the numbers as proof; built by `conveyor pages` in crimson-orb                                                       |
| Quests       | `/quests`, `/quests/<slug>`                                                                                       | the game's quests and puzzles with their answers, read whole from the game's files; built by `conveyor pages` in crimson-orb beside the guides |
| Tools        | `/interceptor-finder`, `/capital-freighter-finder`, `/freighter-finder`, `/living-ship-finder`, `/living-frigate-finder`, `/how-lucky-am-i` | finders give a system; the Interceptor, freighter, and living ship pages are builders that give a shape only                                   |

**No flags.** The site has no feature flags since 2026-11-14 (the owner, for the last release): the finders and builders, the living ship and organic frigate guides, and every link to them are shown, and the Markdown blocks the flags kept (`<!-- living -->`, `<!-- interceptor-finder -->` and the other finders, with their `not-` twins) were unwrapped or dropped. `lib/archive/features.ts` is gone. The corvette guides lost their flag the same way on 2026-11-11.

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

**Quests** (the owner, 2026-11-08) is a section of its own beside the Guides, the Catalog, and the Tools, not a group of the guides menu: its contents page `/quests` lists each quest with its question and `fact`, as a group page does, and each quest stands at `/quests/<slug>` (breadcrumb Home › Quests › quest). It has a header item between Guides and Tools, an item in the phone drawer, a footer column, and its rows in the sitemap. Its pages stay off the guides menu and their trail: no guide leads into one, and battle-moves still leads back to `/about`. `pages` writes them into `statistics.json` beside the guides, listed under `quests` (`QUESTS` in crimson-orb `pages/mod.rs`), so a quest is drawn as a guide is (`TopicScreen`, `{{name}}`, `<!-- widget:KEY -->`); its text is `content/en/quests/<slug>.md`. The paths are `QUESTS_PATH` and `questPath` in `lib/archive/guides.ts`, the pages `QUESTS` in `lib/archive/quests.ts`. Its first page is `puzzles`, the right answer to every puzzle of a building: the number sequences in one table by their numbers, the questions in words in another by their text.

## The site map (2026-11-07)

Status: **the menu is agreed with the owner (2026-11-07); the group and page passes follow.** Written in passes: the
menu first, then each group, then each page. Each pass writes its reasons here, so the next agent does not ask why.

**The rule of the menu's order.** Two halves. The places run from the largest to the smallest: galaxy, system,
station, planet (the owner's order). The gear runs in the order a player upgrades it: the game starts on a planet with
a broken ship and a multitool, and the first thing you craft is the multitool's mining upgrade that digs the
resources to fix the ship; then the ship, then the freighter, then the exosuit and the exocraft, which you never find
and only upgrade through their slots. Creatures come last. The owner first held the whole menu to size, then moved the
multitool up for this reason; a later change of the order must keep both halves or say why it breaks them.

**Exosuit and Exocraft stay two groups** (the owner, 2026-11-07): a merge was agreed and then taken back, since its
new path for the group moved links; Exosuit stays a group of one page for now, followed by Exocraft. A merge, if made
later, needs redirects of `/guides/exosuit`, `/guides/exocraft`, and every guide under them.

### The story the site tells

The owner's aim (2026-11-07): how a player grows strong in No Man's Sky as well and as fast as possible, from the
rules, never a coordinate of a silver bullet. This widens `.claude/rules/site-text.md`'s "how to get the best item":
fishing, Ancient Bones, and creature battles make a player stronger without being an item. The menu reads as one trip:
**where to look** (galaxy, system, station, planet), **what to find** (multitool, ship, freighter), **what you only
upgrade** (exosuit and exocraft), and **who comes with you** (creatures). Each item group runs find → judge → upgrade →
its modules, so a player who stops at any page knows the next step.

### The menu as it stood (before this pass)

Galaxies 2 · Systems 3 · Stations 2 · Planets 4 · Freighters 8 · Ships 11 · Exocraft 6 · Multitools 9 · Exosuit 1 ·
Creatures 7. Problems found:

- **Exosuit** is a group of one page.
- **Fishing** and **Excavation finds** sit in Creatures, between affinity and battle moves, though neither is a
  creature or a battle; each is linked from one page only (the rule asks two).
- **Frigate traits** splits the fleet frigate in two pages while the organic frigate keeps its traits on its own
  page; and both frigate-traits and organic-frigates lead to the same next guide.
- **Freighters before Ships** breaks the order a player meets them: multitool and ship come first in a game,
  the freighter later.

### The proposed menu

| #   | Group      | Guides, in order                                                                                                                                          | Why                                                                                                                                                                                                          |
| --- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Galaxies   | galaxies, where-to-look                                                                                                                                   | unchanged: where to start                                                                                                                                                                                    |
| 2   | Systems    | systems, economy, races                                                                                                                                   | unchanged                                                                                                                                                                                                    |
| 3   | Stations   | space-stations, technology-merchants                                                                                                                      | unchanged: what you can buy before you search                                                                                                                                                                |
| 4   | Planets    | sources-by-size, sources-by-type, empty-worlds, sentinels-and-dissonance, **fishing**, **excavation-finds**                                               | what a planet gives: tools and wrecks first, then the dissonance it hides, then what you catch in its water and dig from its bones; fish bite by planet type and the bones hint is a line of the planet card |
| 5   | Multitools | multitool-types, multitool-classes, multitool-stats, multitool-upgrades, figures, square, supercharged-slots, staffs, multitool-modules                   | moved before Ships: the first thing a player upgrades                                                                                                                                                        |
| 6   | Ships      | ship-types, ship-classes, ship-stats, ship-upgrades, ship-figures, ship-square, interceptors, living-ships, starship-modules, corvettes, corvette-modules | unchanged inside                                                                                                                                                                                             |
| 7   | Freighters | freighters, dreadnoughts, freighter-modules, frigates (with the fleet traits merged in), organic-frigates, sentinel-capital-ship, freighter-technology    | after Ships; frigate-traits is merged into frigates, as the organic frigate holds its own                                                                                                                    |
| 8   | Exosuit    | exosuit-modules                                                                                                                                           | the gear you never find, only upgrade; a group of one page, kept (see above)                                                                                                                                 |
| 9   | Exocraft   | roamer-, nomad-, pilgrim-, colossus-, nautilon-, minotaur-modules                                                                                         | unchanged inside                                                                                                                                                                                             |
| 10  | Creatures  | creature-roles, creature-grades, creature-stats, creature-affinity, battle-moves                                                                          | who comes with you, ending in the battle they fight                                                                                                                                                          |

**Done 2026-11-07 (menu pass):** `MENU_GROUPS` in crimson-orb `pages/mod.rs` holds this order, with Exosuit and
Exocraft as two groups (no group path changed, so no redirect was needed); the closing sentence of each page whose next guide
changed now leads to the new next (sentinels-and-dissonance → fishing, excavation-finds → multitool-types,
multitool-modules → ship-types, starship-modules and corvette-modules → freighters, freighter-technology →
exosuit-modules, exosuit-modules → roamer-modules, minotaur-modules → creature-roles; creature-affinity no longer leads
to fishing). Left for the group passes: fishing and excavation-finds each have one incoming text link (two are asked),
and frigate-traits still waits to be merged into frigates.

Costs to carry out: moved guides change their long path `/guides/<group>/<slug>`, and the 2.1 site already serves the
old ones, so `next.config.ts` needs a redirect for every moved guide and for the group pages `/guides/exosuit` and
`/guides/exocraft`; each group's last guide gets a new closing sentence to the next group's first; `frigate-traits`
redirects to `frigates#traits`.

### Group and page passes (2026-11-07)

Four agents ran the group pass and the page pass in parallel (`site-narrative-passes` workflow), each on its own groups; the coordinator rebuilt the pages once, then checked every `{{name}}` and widget, the store tests, `tsc`, and `eslint`. Their reports follow, as written, with the coordinator's notes after them. The Exosuit and Exocraft blocks were written while the two groups were planned as one; they stay two groups (above), and nothing in the pass depended on the merge.

#### Group pass: Galaxies

galaxies → where-to-look → systems. The group goes from the largest cut (which galaxy) to the next one (where inside it), and each page ends on the next page's question. The site's entry points, /about and the /guides page (`statistics.md`), both link to galaxies. Nothing needs to be split, merged or moved.

#### Group pass: Systems

systems → economy → races → space-stations. The order is: what a star holds, whether it pays (wealth), then when the population matters. races hands over to Stations with "Before you land, a system's station sells upgrade modules". The station-odds widget appears on both systems and economy. That repetition is on purpose: systems answers "how often a station", and economy answers its own secondary query, "pirate system". No moves.

#### Group pass: Stations

space-stations → technology-merchants → sources-by-size. The first page says what a station sells, and the second says how often class S is on sale. The hand-off ("After the shops, the next prize of a system lies on its planets…") opens Planets. The two pages repeated each other on the starship merchant's always list. That list now lives only on space-stations, and technology-merchants refers to it. No moves.

#### Group pass: Planets

sources-by-size → sources-by-type → empty-worlds → sentinels-and-dissonance → fishing → excavation-finds → multitool-types. The order is: what a planet gives (size, then type), what it lacks, the dissonance that hides the rarest finds, then what you catch in its water and dig from its bones. fishing and excavation-finds now have three incoming links each. The closing sentence of excavation-finds now gives the menu's reason for putting Multitools next: the multitool already in your hand is the first thing you upgrade. No moves.

#### Page pass

- galaxies (Which galaxy is best to search?): unchanged. "Of 256 galaxies" and the jump counts are fixed facts of the game, not recount numbers.
- where-to-look (Where in a galaxy should you look for class S items?): unchanged. The page still types "500,000 ly", which reads a chart. Worth a `{{name}}` from the page function later.
- systems (What does a star system hold?): unchanged.
- economy (Which system pays best?): the answer is now "One of high wealth", and stars are named once only, with low/medium/high spelled out, as the Words table asks.
- races (Does it matter whether a system is Gek, Korvax, or Vy'keen?): unchanged.
- space-stations (What does a space station sell?): unchanged. It keeps the always list and the one line on the pirate station.
- technology-merchants (Where do you buy class S upgrade modules?): the repeated always list was cut to a reference to the core modules and reactors.
- sources-by-size (How much does a planet's size give you?): "harmonic camps" became the game's name, Harmonic Camps. "The last table of this group" was ambiguous next to the menu's groups, so it now names the section.
- sources-by-type (Which type of planet holds the most?): added a link to fishing ("the type also decides which fish bite").
- empty-worlds (Can a planet be empty?): added a sentence on what a planet holds beyond its spots (fish, bone piles), linking fishing and excavation finds.
- sentinels-and-dissonance (Where do you find dissonance?): fixed "guard it" to "guard them". Added a sentence on the planet card's lines that links excavation finds.
- fishing (Where do you catch each fish?): unchanged. Incoming links: sentinels-and-dissonance, sources-by-type, empty-worlds.
- excavation-finds (What do you dig up at Ancient Bones?): new closing sentence into multitool-types. Incoming links: fishing, empty-worlds, sentinels-and-dissonance.

#### Group pass: Multitools

The group follows the agreed order: find (types, classes), judge (stats), upgrade (multitool-upgrades, figures, square, supercharged-slots), the staff you build, then modules. Every hand-off already leads into the next page's question, and the group opens and closes correctly: excavation-finds ends "The tool in your hand is a find of its own…" into multitool-types, and multitool-modules ends "The tool covered, the next find is the ship you fly…" into ship-types. Nothing was split or merged.

- **Moved:** "Same cabinet, another tool" went from multitool-classes to multitool-types, renamed "Same cabinet, another type". It says how to get another type from the same cabinet, which answers the types question. Classes keeps one line: a class S cabinet stays class S on reload.
- **Trimmed:** supercharged-slots had full "On the exosuit" and "On a freighter" sections. Neither answers "how do you place modules for the most damage". The exosuit advice is merged into exosuit-modules, and the freighter facts were already on freighters. They are now one short paragraph linking both pages; the "not researched yet" note about freighters stays.
- **Order left as it is:** staffs could sit earlier, since a staff is a find. The current hand-off works, though ("the ceiling needs 50% damage, and a staff is one you build yourself"), and moving it would mean editing MENU_GROUPS.

#### Group pass: Exosuit and exocraft

The group runs exosuit, then the four land exocraft, then Nautilon, then Minotaur. It opens from freighter-technology ("…starting with the suit you wear") and closes from minotaur-modules into creature-roles. Both boundaries are fine.

- **No merge of the four land exocraft pages:** their bodies are nearly identical, but each name is its own primary query in the semantic core ("Roamer modules", and so on). What differs between them (slots, room, supercharged places) is in the first lines.
- **Reordered:** exosuit-modules now runs biggest point first: upgrade modules, then supercharged slots, then the built modules, then jetpack trails.
- **Open:** jetpack trails are off-question (they change no stat), but there is no other page in the group for them. They stay last.

#### Page pass

- **multitool-types** (Which types can you find?): gained the "Same cabinet, another type" section, which links staffs. It answers this page's question.
- **multitool-classes** (Where is a class S multitool?): the cabinet section is down to one line linking types. The anchor "base stats" became "multitool stats", so the link text matches its target.
- **multitool-stats**: unchanged.
- **multitool-upgrades**: unchanged.
- **figures** (Which figure will the slots form?): "20 times rarer" is now `{{cornerGap}}`, so no number is typed.
- **square** (How rare is a square?): the typed "about one in a thousand", "6% to 8%" and "about 7%" are now `{{bestOneIn}}`, `{{typeLow}}`/`{{typeHigh}}` and `{{classLow}}`/`{{classHigh}}`. "Tools we keep" became "The tools a system page lists", per the Words table.
- **supercharged-slots** (How do you place modules for the most damage?): "touch/touching" became "adjacent" (Words table). The exosuit and freighter sections are cut to one paragraph, since they were off-question.
- **staffs**: unchanged.
- **multitool-modules** (What can an upgrade module raise?): the first line now answers ("As many as four stats…"). Upgrade modules come before the built list. "raise the multitool to S" became "upgrade".
- **exosuit-modules** (What can an exosuit upgrade module raise?): sections reordered, biggest first. The supercharged section took the placement advice and the "not researched" note from supercharged-slots, and "touches" became "adjacent".
- **roamer, nomad, pilgrim and colossus modules**: "touching" became "adjacent".
- **nautilon-modules**: the first line now names both families. The list of land exocraft links moved out of the answer line. "bonus of touching" became "adjacency bonus".
- **minotaur-modules**: the first line names the four families. The odd "The Flamethrower is one of them" is gone, and the land exocraft links moved to the second paragraph. "touching" became "adjacent".
- **Links in:** every page in both groups already had at least two incoming text links, so none were added.

**Typed numbers left in place:** these are game-table constants rather than recounts: the stat ranges on multitool-stats, the roll shares 0.99/0.98/0.15–0.20/0.85 on classes, the slot positions, slot counts and "10/8 slots left" on the exocraft pages, and 1.25 on supercharged-slots. Three are measured values that should become `{{name}}` in a later pass: "+3% becomes +28%", "more than triples" and "under two times", all on supercharged-slots.

---

#### Group pass: Ships

Canary: the menu file and MENU_GROUPS match the brief. All 11 pages exist, and each one's closing sentence leads to the next guide in the menu:

- ship-types → ship-classes → ship-stats → ship-upgrades → ship-figures → ship-square → interceptors
- interceptors → living-ships (`<!-- living -->`), or starship-modules (`<!-- not-living -->`)
- living-ships → starship-modules
- starship-modules → corvettes
- corvettes → corvette-modules → freighters

Boundaries: multitool-modules closes into ship-types ("The tool covered, the next find is the ship you fly…"). The group closes into freighters from corvette-modules, or from starship-modules when the corvette flag is off. The trail stays whole with either flag off.

The group runs find → judge → upgrade → modules: the types and classes of wrecks, then stats, then upgrading, then the slot figures and the square. After that come the two special ships (Interceptor, then living ship), the starship modules, and the corvette, which you build rather than find. No split, merge or move is needed. Each page answers its own question. The corvette pair sits last because it is gated, and because a built ship naturally follows the modules it reuses. Every guide already has at least two incoming text links. living-ships and corvette-modules have only two, so I added one more for living-ships (below).

#### Page pass

- **Which ship types lie in wrecks?** (ship-types) I moved "By race" above "By economy". Race doubles one ship type, while wealth moves only one type, so race is the bigger point.
- **How do you find a class S crashed ship?** (ship-classes) The lead now opens with the biggest lever: "Search a pirate system: {{pirateS}} of its wrecks are class S, against {{highS}} at high wealth and none at low. Or look for an Exotic…". The current values are pirate 5%, high 2% and medium 1%, so the old Exotic-first lead hid the main point.
- **How strong can a claimed ship be?** (ship-stats) Unchanged.
- **Should you upgrade a ship or find one at S?** (ship-upgrades) The sections now run "What an upgrade changes", "Where to upgrade", "Stats after an upgrade". The slot change is the answer, so it comes first, and the closing sentence stays last.
- **Which figure will a ship's four supercharged slots form?** (ship-figures) Unchanged.
- **How rare is a square on a ship?** (ship-square) Unchanged.
- **How do you get a Sentinel Interceptor?** (interceptors) Unchanged.
- **How do you get a living ship?** (living-ships) "More ships" now comes right after "Where it lands". It explains getting another ship, which "Name and colours" relies on ("turning a ship down… is the only way to another look"). I dropped the typed count "eleven" before organs, and changed "hull" to "body", because the Words table reserves "ship type" for that sense of "hull".
- **What can a starship upgrade module raise?** (starship-modules) "Upgrade modules" now comes first, since that is the question, and "Every starship module", "Interceptor only" and "Living ship only" follow it. "How to raise the ship itself to S" became "How to upgrade the ship itself to class S". Inside the `<!-- living -->` block there is a new link: "A [living ship](/guides/living-ships) grows organs…".
- **How do you build the best corvette?** (corvettes) "raise it" became "upgrade it" in the lead and in step 3. The typed "three of the best of each group" became `{{limit}}`, which the corvettes page function already provides. "Damage" now comes before "Size" and "Speed", because the Phase Beam build is the key choice in a build. I spelled maneuverability as on ship-stats, so the site uses one spelling. The Fabricate Corvette Modules details now sit in "Where to find corvette parts".
- **What can a corvette upgrade module raise?** (corvette-modules) I took the derelict-freighter Fabricate sentence out of the lead and moved it to corvettes. It is about where parts come from, not about modules. Spelling is now maneuverability.

#### Group pass: Freighters

Order: freighters → dreadnoughts → freighter-modules → frigates → organic-frigates (living) → sentinel-capital-ship → freighter-technology. Ships hands into the group from corvette-modules and starship-modules ("Above your ship, a system's next prize is in its sky…"). The group hands on to Exosuit and exocraft from freighter-technology ("…the suit you wear: exosuit modules"). Both are unchanged.

- **frigate-traits merged into frigates.** The section is called "Frigate traits" (anchor `#frigate-traits`) and keeps the search heading. It holds the fleet traits table and a "Reward frigates" subsection. The organic traits stay on organic-frigates. The old page's two links were repointed. The closing sentence is now a `living` / `not-living` pair: with the flag on it leads to organic-frigates, with it off to sentinel-capital-ship. This fixes the problem of two pages leading to the same next guide.
- **"To destroy it" moved from dreadnoughts to freighter-modules.** The dreadnoughts question is about getting the ship, and a destroyed one pays a module instead. The trench steps and the `dreadnoughtShields` widget now answer "how do you get class S freighter modules". Dreadnoughts keeps the surrender steps and one sentence that links to the trench steps.
- **The upgrade module list on freighters is cut to one paragraph.** The list was a copy of the one on freighter-technology, and the paragraph links to freighter-technology and freighter-modules.
- I considered moving sentinel-capital-ship to right after dreadnoughts, so the capital ships sit together. I kept the agreed order.

#### Group pass: Creatures

Order: creature-roles → creature-grades → creature-stats → creature-affinity → battle-moves → /about. The group opens from minotaur-modules ("What is left to claim on a planet is alive: creature roles"). Every hand-off reads naturally, and no splits or moves between pages were needed beyond the one below.

#### Page pass

- **freighters**: "How do you get a class S capital freighter?" The sections are reordered biggest point first: Regular and capital, The battle on arrival, One ship many classes, Wealth and class, Can you buy a class S?, Supercharged slots, Upgrade modules (now short). The typed price and slot numbers became `{{costBase}}`, `{{costSlots}}`, `{{costPower}}`, `{{bonusB}}`, `{{bonusA}}`, `{{bonusS}}`, `{{generalC}}`, `{{techC}}`, `{{generalS}}` and `{{techS}}`. "Hulls" became "freighters", per the Words table.
- **dreadnoughts**: "How do you get a class S dreadnought?" The destroy steps moved out because they answer a different question.
- **freighter-modules**: "How do you get class S freighter modules?" The thin list of steps was replaced by the full trench walk-through with its widget.
- **frigates**: "How do you get a class S frigate?" It gained the "Frigate traits" section after "A good frigate", and the closing is now flag-aware.
- **organic-frigates**: unchanged, except its link now goes to `/guides/frigates#frigate-traits`.
- **sentinel-capital-ship** and **freighter-technology**: no change.
- **creature-roles**: "Which creatures can you adopt on a planet?" It gained "Two bodies, one species", which moved from affinity because it is about what counts as a species, not about affinity. That section adds a link to creature-affinity.
- **creature-grades**: no change.
- **creature-stats**: "What are a creature's letters worth?" "The number behind it" now comes before "The letter", because the number is the answer. The Levels section links gene edits to battle-moves.
- **creature-affinity**: "What sets a creature's affinity?" The planet-type, kinds and mechanical sections come first. "What affinity gives" is renamed "What affinity does in a battle" and now comes last, before the closing sentence to battle-moves.
- **battle-moves**: no change.

**Text for seo.md, replacing the redirect line:** "frigate-traits redirects to `frigates#frigate-traits` (from `/statistics/`, `/guides/` and `/guides/freighters/`); done 2026-11-07."

**Typed numbers still in the text** (the rule is not met yet; each needs a Rust constant):

- freighters: the 6 ships in the hangar
- freighter-technology: 200 to 250, 5,000,000 and 10,000,000, the 55/25/15/5 split
- dreadnoughts: 35 seconds and 2 more per engine
- freighter-modules: 21, about one in 140 and one in 350, 250
- creature-stats: 575 to 725 and 425 to 525, 20%, 0.4 to 4, level 10
- creature-grades: 15%
- creature-affinity: 1.66 and 0.66, one in ten
- creature-roles: 23

#### Coordinator's notes

- **Cross-group requests carried out:** multitool-types now opens with the multitool you wake up with, so the hand-off
  from excavation-finds lands; supercharged-slots links ship figures beside the square on a ship; organic-frigates
  links back to living ships inside a `living` block.
- **Typed numbers.** The rule asks every number of a page's own line to come from `{{name}}`. The agents left game
  constants and formula bounds typed (stat ranges, slot counts, roll shares, the 1.25 supercharge, ship-stats' bounds,
  freighter-technology's split, creature-stats' ranges) and listed measured values still typed (supercharged-slots'
  "+3% becomes +28%", "more than triples", "under two times"; where-to-look's 500,000 ly; the counts listed by the
  Freighters and Creatures agent). Open: whether game constants fall under the rule. Until the owner decides, the
  measured ones are the next pass.
- **Not done here:** the "one question" line of `.claude/rules/site-text.md` still says "how to get the best item";
  the owner's wider aim (above) is to be carried there when the owner approves the wording.

## The semantic core

Primary and secondary queries by page. The order is judgement, not measured search volume. The pages worth the most:
multitool-classes, ship-classes, freighters, interceptors, living-ships, station-upgrades, staffs, multitool-upgrades,
ship-upgrades, organic-frigates, how-lucky-am-i.

| Page                                                               | Primary query                                                                             | Secondary                                                                |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `/`                                                                | best items no man's sky                                                                   | where to find S-class multitool; crashed ship locations; portal glyphs   |
| `/about`                                                           | how supercharged slots work                                                               | adjacent supercharged slots; multitool sources                           |
| `/guides`                                                          | no man's sky guides                                                                       | where to find class S; farming guide                                     |
| `/tool`                                                            | multitools with adjacent supercharged slots (not "S-class": most listed tools are A or B) | multitool glyphs; staff locations                                        |
| `/ship`                                                            | crashed ships with adjacent supercharged slots                                            | S-class crashed ship; exotic crashed ship; Sentinel Interceptor wreck    |
| `/creature`                                                        | best creature to adopt                                                                    | all-S creature; companion stats                                          |
| `/interceptor-finder`                                              | Sentinel Interceptor builder, Interceptor parts                                           | Interceptor parts; Interceptor colours                                   |
| `/capital-freighter-finder`                                        | capital freighter locations                                                               | best capital freighter; freighter battle system                          |
| `/freighter-finder`                                                | freighter shapes                                                                          | regular freighter; freighter parts                                       |
| `/living-ship-finder`                                              | living ship parts                                                                         | living ship types; Void Egg ship shapes                                  |
| `/how-lucky-am-i`                                                  | multitool rating                                                                          | is my multitool good; ship stats calculator; best staff stats            |
| galaxies                                                           | best galaxy                                                                               | harsh, lush galaxy; galaxy types                                         |
| where-to-look                                                      | where to find multitools                                                                  | galaxy core or rim; uncharted systems                                    |
| systems                                                            | star system types                                                                         | star colour; how many planets                                            |
| economy                                                            | wealthy system                                                                            | economy and class S; pirate system                                       |
| races                                                              | Gek, Korvax, Vy'keen systems                                                              | Atlantid multitool; race and ship type                                   |
| space-stations                                                     | space station merchants                                                                   | technology merchant; pirate station; abandoned station                   |
| station-upgrades                                                   | S-class upgrade modules                                                                   | where to buy S modules; station stock                                    |
| freighters                                                         | S-class capital freighter                                                                 | free capital freighter; freighter battle                                 |
| dreadnoughts                                                       | pirate dreadnought                                                                        | seize a dreadnought                                                      |
| freighter-modules                                                  | S-class freighter modules farm                                                            | dreadnought modules; hyperdrive module                                   |
| frigates                                                           | S-class frigate                                                                           | frigate traits; frigate levels; Raider                                   |
| organic-frigates                                                   | organic frigate                                                                           | Dream Aerial; cosmic whale; dream answers                                |
| sentinel-capital-ship                                              | Sentinel capital ship                                                                     | Carrier AI Fragment; wanted level 5                                      |
| sources-by-size, sources-by-type, empty-worlds                     | best planet for multitools and wrecks                                                     | planet size; biome; sea level                                            |
| sentinels-and-dissonance                                           | dissonant planet                                                                          | dissonance resonator; corrupted Sentinels                                |
| multitool-types                                                    | multitool types                                                                           | Royal, Sentinel, Atlantid, Alien, staff                                  |
| multitool-classes                                                  | S-class multitool                                                                         | class by wealth                                                          |
| multitool-stats                                                    | best multitool stats                                                                      | max damage; scanner                                                      |
| multitool-upgrades                                                 | upgrade multitool to S                                                                    | upgrade or find at S                                                     |
| figures, square                                                    | adjacent supercharged slots                                                               | 2×2 square; slot layouts                                                 |
| supercharged-slots                                                 | supercharged slots                                                                        | adjacency bonus; best module placement; max multitool damage             |
| roamer-, nomad-, pilgrim-, colossus-modules                        | Roamer modules (and each exocraft's name)                                                 | exocraft upgrades; exocraft slots; Colossus build                        |
| staffs                                                             | best staff head                                                                           | Autophage staff; staff terminal                                          |
| ship-types                                                         | ship types                                                                                | exotic, solar, hauler, fighter, explorer, shuttle                        |
| ship-classes                                                       | S-class crashed ship                                                                      | class by wealth                                                          |
| ship-stats                                                         | best ship stats                                                                           | max hyperdrive; damage; shield                                           |
| ship-upgrades                                                      | upgrade ship to S                                                                         | do upgrades change stats; ship supercharged slots                        |
| ship-figures, ship-square                                          | ship supercharged slots                                                                   | adjacent; square                                                         |
| interceptors                                                       | how to get a Sentinel Interceptor                                                         | Interceptor class S; dissonant planet                                    |
| living-ships                                                       | how to get a living ship                                                                  | Void Egg; living ship quest                                              |
| creature-roles, creature-grades, creature-stats, creature-affinity | all-S creature                                                                            | companion; Trait Potential; affinity                                     |
| `/quests`                                                          | no man's sky quests                                                                       | puzzles and answers                                                      |
| puzzles (`/quests/puzzles`)                                        | no man's sky puzzle answers                                                               | number sequence puzzle; manufacturing facility answers; monolith answers |
| each quest (`/quests/<slug>`)                                      | the quest's name and "rewards"                                                            | the quest's steps; the item it gives                                     |
| the merchant guides of Stations (forsaken-trader … anomaly-module-merchant) | what the merchant sells                                                          | its stock; what it takes in trade; where it stands                       |

### The game's name (2026-11-11)

The owner found "No Man's Sky" repeated on the quest and merchant pages: in the browser title, again in the bold
opening question ("What does the Cartographer sell in No Man's Sky?"), and again in the `fact` ("What the Cartographer
sells in No Man's Sky: …"), which is the page's description in search. The decision: the name stands **once a page, in
the `<title>`**, the one place a search engine needs it, since a bare "Cartographer" or "Lost in Space" names nothing
outside the game; the template `<title> in No Man's Sky — Atlas Archive` (`app/guides/[group]/[slug]/page.tsx`,
`app/quests/[slug]/page.tsx`) stays as it is. The question and the `fact` drop it: a search result shows the title above
the description, so the description repeating it was duplication, and the guides written before these pages never named
the game in their question or `fact` (fishing did; it was brought in line). The facts are now an answer each, written
in `FACTS` of crimson-orb `pages/merchants.rs` and `pages/quests.rs` (a test keeps each at 160 characters and free of the
name), in place of the one template that described the page ("its N items, each with its picture…, read from the game's
files"). No template outside these two groups changed: the catalog, tools, the group pages, and the home page name the
game once in their own title or description, which is not a repetition. The rule is in `.claude/rules/site-text.md`.

**Quest and merchant pages outside the read-on chain** (the owner, 2026-11-11). Their closing sentence links the guide
of what the page gives or sells, or a related merchant or quest, not the next page of the menu. The chain of the other
guides stays whole: Station technology merchants still leads to the Forsaken Trader, and the Space Anomaly Module
Merchant still hands on to Sources by planet size, so the Planets group is reached from Stations. A guide that names a
merchant or a quest item links that page in its sentence (corvettes, freighter technology, the module guides' Illegal
modules, ship types, frigates' boosts, space stations' other merchants).

## The links

- **External.** The one external link cites a rule: Google's data policy on the privacy page.
- **Menus.** Header items are real links (`ArchiveBar.tsx`). The word Guides is a link to `/guides` and the arrow beside it opens the menu, where a group's name opens the group's page; there is no All guides item. Quests is a plain link to `/quests`, in the header and in the drawer. The drawer is the same list on a phone, an accordion inside the Guides one: each name opens its page, the arrow beside it what lies under it.
- **Footer.** `ArchiveShell.tsx`: five columns, the legal pages first, then the Catalog lists, one link a group of
  guides (to the group's own page), the Quests page, and the tools from `lib/archive/tools.ts`. It does not repeat the whole menu.
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
