import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FreighterFinder } from "@/components/archive/FreighterFinder";
import { PageTrail } from "@/components/archive/PageTrail";
import { StructuredData } from "@/components/archive/StructuredData";
import { readContent } from "@/lib/archive/content";
import { FINDERS_ENABLED } from "@/lib/archive/features";
import { trailData } from "@/lib/archive/trail";

const TRAIL = [
  { name: "Home", href: "/" },
  { name: "Capital freighter finder" },
];

export const metadata: Metadata = {
  title:
    "No Man's Sky capital freighter finder: find a capital freighter by its shape — Atlas Archive",
  alternates: { canonical: "/capital-freighter-finder" },
  description:
    "Pick the hull, length, and parts of a capital freighter and get the portal glyphs of a No Man's Sky system whose space battle saves that ship.",
};

// Hidden while the finders flag is off: the page answers 404.
export default async function CapitalFreighterFinderPage() {
  if (!FINDERS_ENABLED) {
    notFound();
  }
  return (
    <>
      <StructuredData data={trailData(TRAIL)} />
      <PageTrail steps={TRAIL} />
      <FreighterFinder
        kind="capital"
        html={await readContent("capital-freighter-finder")}
      />
    </>
  );
}
