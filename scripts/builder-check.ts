// The builder core's proof over every ship (docs/ships/part-graph.md, Step 4, in
// crimson-orb): from the start, every option of every group the walk can reach is
// picked once, and the walk must then stand on that option (`pick` then `choiceOf`
// is the identity); every group must be reached in some state, and every reached
// group must stand on an option. Run with `npm run builder:check`.

import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  choiceOf,
  pick,
  treeCore,
  type Assignment,
  type Parts,
  type TreeCore,
} from "../lib/archive/builder/tree";
import type { PartGroup } from "../lib/archive/builder/parts";

const ROOT = join(import.meta.dirname, "..");

// The ships: the groups JSON and the published parts.json of each, as the ship
// modules in lib/archive hold them. The living ship leaves its Feelers group off
// the page (`living-ship-parts.ts`), so the check does too.
const SHIPS: [string, string, string | null][] = [
  ["interceptor", "public/interceptor", null],
  ["capital-freighter", "public/freighter/capital", null],
  ["regular-freighter", "public/freighter/regular", null],
  ["living-ship", "public/living-ship", "TopAcc_A"],
  ["living-frigate", "public/living-frigate", null],
];

let failures = 0;

function fail(ship: string, message: string) {
  failures += 1;
  console.error(`${ship}: ${message}`);
}

function check(ship: string, core: TreeCore) {
  const tried = new Set<string>();
  const reachedOnce = new Set<string>();
  const states: Assignment[] = [core.start];
  // Every (group, option) is picked once, in the first state that reaches the
  // group; the states a pick makes are explored in turn, so a group behind
  // another pick (the frame's skirting behind Hull plates Without) has its turn.
  while (states.length) {
    const assignment = states.shift() as Assignment;
    const choice = choiceOf(core, assignment);
    for (const group of core.groups) {
      if (choice[group.id] === undefined) {
        continue;
      }
      reachedOnce.add(group.id);
      for (const option of group.options) {
        const key = `${group.id}:${option.id}`;
        if (tried.has(key)) {
          continue;
        }
        tried.add(key);
        const next = pick(core, assignment, group, option.id);
        const stands = choiceOf(core, next)[group.id];
        if (stands !== option.id) {
          fail(
            ship,
            `picked ${group.id}=${option.id}, the walk stands on ${stands}`,
          );
        }
        states.push(next);
      }
    }
  }
  for (const group of core.groups) {
    if (!reachedOnce.has(group.id)) {
      fail(ship, `group ${group.id} (${group.title}) is never reached`);
    }
  }
}

for (const [ship, folder, dropped] of SHIPS) {
  const parts = JSON.parse(
    readFileSync(join(ROOT, folder, "parts.json"), "utf8"),
  ) as Parts;
  const rows = JSON.parse(
    readFileSync(join(ROOT, "lib/archive", `${ship}-groups.json`), "utf8"),
  ) as PartGroup[];
  const groups = rows.filter((group) => group.id !== dropped);
  const core = treeCore(parts, groups);
  const broken = core.start.findIndex((key) => key === undefined);
  if (broken >= 0) {
    fail(ship, `list ${broken} holds no part at the start`);
  }
  check(ship, core);
  console.log(
    `${ship}: ${core.lists.length} lists, ${groups.length} groups, start ${
      Object.keys(choiceOf(core, core.start)).length
    } chips`,
  );
}

if (failures) {
  console.error(`${failures} failures`);
  process.exit(1);
}
console.log("every pick stands");
