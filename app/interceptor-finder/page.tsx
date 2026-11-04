import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InterceptorFinder } from "@/components/archive/InterceptorFinder";
import { PageTrail } from "@/components/archive/PageTrail";
import { StructuredData } from "@/components/archive/StructuredData";
import { readContent } from "@/lib/archive/content";
import { FINDERS_ENABLED } from "@/lib/archive/features";
import { trailData } from "@/lib/archive/trail";

const TRAIL = [
  { name: "Home", href: "/" },
  { name: "Sentinel Interceptor finder" },
];

export const metadata: Metadata = {
  title:
    "No Man's Sky Interceptor finder: find a Sentinel Interceptor by its parts and colour — Atlas Archive",
  alternates: { canonical: "/interceptor-finder" },
  description:
    "Pick the cockpit, wings, hull, and colour of a Sentinel Interceptor and get the portal glyphs of a No Man's Sky system whose crashed Interceptors are built that way.",
};

// Hidden while the finders flag is off: the page answers 404.
export default async function InterceptorFinderPage() {
  if (!FINDERS_ENABLED) {
    notFound();
  }
  return (
    <>
      <StructuredData data={trailData(TRAIL)} />
      <PageTrail steps={TRAIL} />
      <InterceptorFinder html={await readContent("interceptor-finder")} />
    </>
  );
}
