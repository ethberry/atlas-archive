"use client";

import { Article } from "@/components/archive/Article";
import { Builder } from "@/components/archive/builder/Builder";
import { LIVING_FRIGATE } from "@/lib/archive/living-frigate-parts";

// The living frigate builder: the builder core over the living frigate's module.
function Finder() {
  return <Builder ship={LIVING_FRIGATE} />;
}

export function LivingFrigateFinder(props: { html: string }) {
  return <Article html={props.html} widgets={{ finder: Finder }} />;
}
