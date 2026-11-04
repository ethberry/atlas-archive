# How it works

How do you get the best item in No Man's Sky? Every star system on this site lists up to six multitools and two ships, the best that system holds. A single system holds thousands of places that hand you a tool, so that short list is the end of a long trail.

This page walks that trail, from a galaxy of trillions of stars down to a list you can read while your starship cools down. Every number here is an average over voxels of [Euclid](/galaxy/b7e59a53-13de-521b-af6b-dcbf6280eb9d), with a smaller look at three other galaxies, rounded to something a person can remember.

<!-- widget:tiles -->

## What you can find here

This site is an item finder for No Man's Sky. It lists three things, each with the glyphs and the spot where you go to pick it up.

- **[Multitools](/tool)** from shops, monoliths, harmonic camps, sentinel pillars, space stations, and Autophage terminals.
- **[Crashed ships](/ship)** you can claim where they lie.
- **[Creatures](/creature)** you can adopt, each with its [grades](/guides/creature-grades).

The [guides](/guides) say where each kind of item comes from, from the galaxy down to the planet.<!-- finders --> The [Sentinel Interceptor finder](/interceptor-finder) and the [capital freighter finder](/capital-freighter-finder) give you a system with the ship you want.<!-- /finders --> Already holding one? [How lucky am I?](/how-lucky-am-i) scores it from 0 to 100.

Everything below turns on **supercharged slots**. A class S multitool or ship has four. A module in one of them is worth far more than the same module next door, and modules of one kind boost each other when they sit side by side. Put both effects together and the best build is a block of four adjacent supercharged slots, all one kind of technology. Scattered slots cannot do that, so where the four slots lie matters more than the class, the name, or the colour.

## The size of the haystack

A galaxy is about {{galaxyAcross}} light years across and {{galaxyThick}} thick. Think of it as cut into voxels: cubes of space about 400 light years a side. There are {{regionsInGalaxy}} of them.

<!-- widget:scale -->

Looking at one system every second, day and night, you would finish in about {{yearsToLook}} years. Bring snacks. Not all of those [systems](/guides/systems) are worth the second.

## Where a multitool comes from

Five kinds of place hand you a multitool, and planets are far busier than they look from orbit.

<!-- widget:sources -->

A planet can hold thousands of these spots, or none, as [empty worlds](/guides/empty-worlds) shows. Spots count above sea level and off the cliffs only, for a reason the funnel below makes plain.

- A **shop** weapon cabinet sells a pistol or a rifle, and now and then something stranger.
- A **monolith** of the Korvax gives an Atlantid tool, in one of three colours. Gek and Vy'keen monoliths give none.
- A **space station** has two weapon cabinets, and a pirate station one, with a pistol or a rifle, and now and then something stranger.
- A **harmonic camp** holds a Sentinel tool in a sealed crate, a pistol or a rifle.
- A **sentinel pillar** is the only source of Royal tools and the main one for Experimental and Alien. Every pillar of a planet gives the same tool, so however many stand there, a planet counts once.

Here is the twist. A cabinet does not hold one fixed tool, and that goes for the station's cabinets too. What it offers depends on where in the system you start your session: any of its planets, or the space station. So every source is really a handful of different chances, and each system ends up with about {{offersPerSystem}} of them.

A **staff** is the exception. No place hands you one whole: you assemble it from parts at an Autophage terminal, which stands hidden by robot heads, beacons, crashed freighters, drop pods, and debris, until you scan close by with the right part fitted. The result depends on the head you fit and on the terminal where you build it, so the same parts at two terminals make two different staffs. The core and the backbone only change the look.

## The multitool funnel

Now the sieve. Each row keeps only what passed the row above.

<!-- widget:toolFunnel -->

Reading it from the top:

1. **Sea level and slope.** A building cannot stand under the sea, nor on a slope steeper than the game allows, so where a spot falls in the water or on a cliff the game builds nothing: no shop, no monolith, no pillar, and no tool. That rule takes about {{groundToolShare}} of the spots away before anything else is asked.
2. **Chances.** Here the count grows instead of shrinking. A cabinet, a monolith, a camp, and a pillar give one chance for every place you can start from, each planet and the station. A staff spot gives seven, one for each head. Four spots in five are staff spots, so on average a spot turns into about seven chances, the ×7 of that row.
3. **Adjacent at S.** The four slots must form one [tetris figure](#five-little-figures). Only {{touchingShare}} do. This one step drops {{touchingOneIn}} of every 100 chances, and it is the step everybody cares about.
4. **No trips.** Some of those tools appear only if you start elsewhere and come back. We keep the ones you get by starting on that planet and walking up.
5. **One of a kind.** Two pistols with the same four slots are the same pistol to us, wherever they stand, and the higher class stays. The name does not count, since you can rename a tool anyway.
6. **The list.** At most {{toolCap}} per system, one of each type first, so a short list shows the widest choice.

A tool below S is fine here. The slots we show are the ones it has at S, so you pay for the upgrade yourself, and they do not change.

From {{offersPerSystem}} chances to {{toolsPerSystem}}. That is one in about {{toolRatio}}, and the average system is not even the interesting one. We will get to that.

Here is what survives, type by type, counted in one voxel: families stay together, largest first, and the last column is what reaches a system page.

<!-- widget:types -->

Look at the Royal row among the [multitool types](/guides/multitool-types). A pillar pays a Royal about one time in {{royalOneIn}}, which sounds generous, but a planet gives one pillar tool against thousands of shops and monoliths. Royal tools are rare because pillars are.

[Staffs](/guides/staffs) are not in that table. A tool waits for you to find it, while a staff does not exist until you build it, and every terminal can build seven, one for each head. Counted with the others they would swamp everything, so they get a table of their own.

<!-- widget:staffs -->

## Five little figures

Four adjacent slots can only make five shapes, if a mirror image counts as the same shape. Turn them and mirror them, and they are 19 different [tetris figures](/guides/figures). Turns says how many figures a shape holds, and Places how many spots it fits on a multitool and on a ship: {{toolPlacements}} for a multitool, {{shipPlacements}} for a ship.

<!-- widget:figures -->

[The square](/guides/square) is the one everyone wants, since every slot sits beside two others. It is also among the rarest: about {{squareShare}} of adjacent tools, or one in about {{squareOneIn}} of all tools at the pillars.

One voxel is enough to see how crowded this gets. In a single voxel, pistols and rifles each filled **all {{pistolPlacements}} placements** once any class is allowed. There are simply more chances than places. The hard part was never finding a figure. It is finding one at S, on the spot, with no trips, and [multitool classes](/guides/multitool-classes) shows how few lie there.

<!-- widget:classes -->

## The ship funnel

Ships are simpler. The same rule of sea level and slope comes first: a crashed ship lies on dry ground that is not too steep, or deep enough under the sea for the sunken kind, and never on a cliff. That leaves out about {{groundShipShare}} of the spots. After that a crashed ship needs no trips, and any class is fine, since the slots are what you cannot change.

<!-- widget:shipFunnel -->

Note the drop from adjacent to kept, across all the [ship types](/guides/ship-types). Wrecks of one system share a small set of layouts, so a system with one good ship tends to hold many copies of it: about {{wrecksPerShip}} adjacent wrecks for each ship we keep. Interceptors make up {{interceptorAll}} of wrecks and {{interceptorKept}} of what we keep, because each one has a layout of its own.<!-- finders --> The [Sentinel Interceptor finder](/interceptor-finder) gives a system by the parts you want.<!-- /finders -->

<!-- widget:hulls -->

## What a good system looks like

The honest average is small: a system keeps about {{toolsPerSystem}} multitools and {{shipsPerSystem}} ships. But that average mixes full systems with empty ones.

<!-- widget:histogram -->

About {{toolSystems}} of systems hold no multitool worth listing, and {{noShipSystems}} no ship. Where there is a ship there are usually a couple: **{{shipsPerFinding}} per system that has one**. Where there is a multitool, there are about {{toolsPerFinding}}. Planet by planet it thins out further: about {{planetTools}} of planets hold a multitool we keep, and {{planetShips}} a ship.

A system with six multitools and two ships at once is rare, about {{fullOneIn}}. Those are the systems we go looking for, and even then a full list is not always there. So the list on a system page is not a typical system. It is one of the best we could find.

## Does the galaxy matter?

For tools and wrecks, not much: a system gives about the same in each type of galaxy, and the small differences below are within the wobble of a smaller look. The planets and the Sentinels are what really change, as [galaxies](/guides/galaxies) shows.

<!-- widget:galaxies -->

## The star of the show

We show {{showcaseRegular}} systems across {{showcaseGalaxies}} galaxies: {{showcaseList}}. Each of them shows tetris figures without a square.

They are good finds, and none of them is the best of its kind. No multitool or ship on show beats what the same one found at class A becomes once you upgrade it to S. The ones that lie at S with the strongest stats are still out there, and so is every square but one. There is plenty left to find.

One more system holds the exception: **{{starTool}}**, a staff with a perfect square, in the {{starSystem}} system of {{starGalaxy}}. Nobody finds it lying around: you build it, then upgrade it from class B.

{{starGalaxy}} is a long way from Euclid. How to get there, and how to build it, we leave to you. It is meant for the patient.

## About these numbers

Everything here is an average over about {{regions}} voxels of Euclid scattered around the core, rounded, and {{otherRegions}} voxels each of three other galaxies. Star counts cover {{regionsCounted}} voxels. Finds come from about {{starsPerRegion}} stars of each voxel, scaled up to the whole voxel, and the averages hold to ±1%.

The numbers say where to look. The finds are still yours to make.
