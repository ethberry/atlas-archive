"use client";

import { Article } from "@/components/archive/Article";
import { Builder } from "@/components/archive/builder/Builder";
import { LIVING_SHIP } from "@/lib/archive/living-ship-parts";

// The living ship builder: the builder core over the living ship's module.
function Finder() {
  return <Builder ship={LIVING_SHIP} />;
}

export function LivingShipFinder(props: { html: string }) {
  return <Article html={props.html} widgets={{ finder: Finder }} />;
}
