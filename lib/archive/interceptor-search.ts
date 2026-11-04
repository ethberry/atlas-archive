import "server-only";

import {
  FORMS,
  FORM_LOOKS,
  LOOK_COUNT,
  fitter,
  formHolds,
  type PartChoice,
} from "@/lib/archive/interceptor-parts";
import table from "@/lib/archive/search/table.json";

// One system for every look of every form the walk met, written by
// generator/search/examples/table.rs. This file and the table never reach a browser.

const CODE_BYTES = 6;
const systems = Buffer.from(table.systems, "base64");

// The row of the first look of each form.
const firstRow: number[] = [];
let rows = 0;
FORM_LOOKS.forEach((_, form) => {
  firstRow.push(rows);
  for (let look = 0; look < LOOK_COUNT; look += 1) {
    rows += Number(formHolds(form, look));
  }
});

function code(form: number, look: number) {
  let row = firstRow[form];
  for (let at = 0; at < look; at += 1) {
    row += Number(formHolds(form, at));
  }
  return systems
    .subarray(row * CODE_BYTES, (row + 1) * CODE_BYTES)
    .toString("hex")
    .toUpperCase();
}

// The system of the first form, in file order, that fits `choice` in `look`, so one
// choice always gives one answer.
export function findInterceptor(choice: PartChoice, look: number) {
  const fits = fitter(choice);
  const form = FORMS.findIndex(
    (row, index) => fits(row) && formHolds(index, look),
  );
  return form < 0 ? null : code(form, look);
}
