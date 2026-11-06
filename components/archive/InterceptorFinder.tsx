"use client";

import { Article } from "@/components/archive/Article";
import { Builder } from "@/components/archive/builder/Builder";
import { INTERCEPTOR } from "@/lib/archive/interceptor-parts";

// The Sentinel Interceptor builder: the builder core over the Interceptor's module.
function Finder() {
  return <Builder ship={INTERCEPTOR} />;
}

export function InterceptorFinder(props: { html: string }) {
  return <Article html={props.html} widgets={{ finder: Finder }} />;
}
