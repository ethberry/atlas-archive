import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CapitalFreighterFinder } from "@/components/archive/CapitalFreighterFinder";
import { PageTrail } from "@/components/archive/PageTrail";
import { StructuredData } from "@/components/archive/StructuredData";
import { readContent } from "@/lib/archive/content";
import { CAPITAL_FREIGHTER_FINDER_ENABLED } from "@/lib/archive/features";
import { trailData } from "@/lib/archive/trail";

const TRAIL = [{ name: "Home", href: "/" }, { name: "Capital freighters" }];

export const metadata: Metadata = {
  title:
    "No Man's Sky capital freighters: every capital freighter shape — Atlas Archive",
  alternates: { canonical: "/capital-freighter-finder" },
  description:
    "Pick the hull, length, and parts of a No Man's Sky capital freighter and see the ship the game builds.",
};

// Hidden while its finder flag is off: the page answers 404. A builder for now;
// the search comes back on a search core of its own.
export default async function CapitalFreighterFinderPage() {
  if (!CAPITAL_FREIGHTER_FINDER_ENABLED) {
    notFound();
  }
  return (
    <>
      <StructuredData data={trailData(TRAIL)} />
      <PageTrail steps={TRAIL} />
      <CapitalFreighterFinder
        html={await readContent("capital-freighter-finder")}
      />
    </>
  );
}
