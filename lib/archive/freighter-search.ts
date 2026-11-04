import "server-only";

import {
  freighterForm,
  type SearchedKind,
} from "@/lib/archive/freighter-parts";
import type { PartChoice } from "@/lib/archive/interceptor-parts";
import capital from "@/lib/archive/search/freighter-table.json";
import regular from "@/lib/archive/search/regular-freighter-table.json";

// One system for every form of each kind, written by
// generator/search/examples/freighter_table.rs. This file and the tables never
// reach a browser.

const CODE_BYTES = 6;
const SYSTEMS: Record<SearchedKind, Buffer> = {
  capital: Buffer.from(capital.systems, "base64"),
  regular: Buffer.from(regular.systems, "base64"),
};

// The system of the first form, in file order, that fits `choice`, so one choice
// always gives one answer.
export function findFreighter(kind: SearchedKind, choice: PartChoice) {
  const form = freighterForm(kind, choice);
  return form < 0
    ? null
    : SYSTEMS[kind]
        .subarray(form * CODE_BYTES, (form + 1) * CODE_BYTES)
        .toString("hex")
        .toUpperCase();
}
