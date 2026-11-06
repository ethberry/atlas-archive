"use client";

import { Article } from "@/components/archive/Article";
import { Builder } from "@/components/archive/builder/Builder";
import { REGULAR_FREIGHTER } from "@/lib/archive/regular-freighter-parts";

// The regular freighter builder: the builder core over the regular freighter's
// module.
function Finder() {
  return <Builder ship={REGULAR_FREIGHTER} />;
}

export function RegularFreighterFinder(props: { html: string }) {
  return <Article html={props.html} widgets={{ finder: Finder }} />;
}
