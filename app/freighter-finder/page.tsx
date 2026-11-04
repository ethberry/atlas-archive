import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FreighterFinder } from "@/components/archive/FreighterFinder";
import { PageTrail } from "@/components/archive/PageTrail";
import { StructuredData } from "@/components/archive/StructuredData";
import { readContent } from "@/lib/archive/content";
import { FINDERS_ENABLED } from "@/lib/archive/features";
import { trailData } from "@/lib/archive/trail";

const TRAIL = [{ name: "Home", href: "/" }, { name: "Freighter finder" }];

export const metadata: Metadata = {
  title:
    "No Man's Sky freighter builder: every shape of a regular freighter — Atlas Archive",
  alternates: { canonical: "/freighter-finder" },
  description:
    "A freighter builder for No Man's Sky: put a regular freighter together from its hull, length, and parts, and see every shape the game makes. Fleets bring each shape to any system.",
};

// Hidden while the finders flag is off: the page answers 404.
export default async function FreighterFinderPage() {
  if (!FINDERS_ENABLED) {
    notFound();
  }
  return (
    <>
      <StructuredData data={trailData(TRAIL)} />
      <PageTrail steps={TRAIL} />
      <FreighterFinder
        kind="regular"
        html={await readContent("freighter-finder")}
      />
    </>
  );
}
