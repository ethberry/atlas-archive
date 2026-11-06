"use client";

import { Article } from "@/components/archive/Article";
import { Builder } from "@/components/archive/builder/Builder";
import { CAPITAL_FREIGHTER } from "@/lib/archive/capital-freighter-parts";

// The capital freighter builder: the builder core over the capital freighter's
// module.
function Finder() {
  return <Builder ship={CAPITAL_FREIGHTER} />;
}

export function CapitalFreighterFinder(props: { html: string }) {
  return <Article html={props.html} widgets={{ finder: Finder }} />;
}
