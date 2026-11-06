import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LivingShipFinder } from "@/components/archive/LivingShipFinder";
import { PageTrail } from "@/components/archive/PageTrail";
import { StructuredData } from "@/components/archive/StructuredData";
import { readContent } from "@/lib/archive/content";
import { LIVING_SHIPS_ENABLED } from "@/lib/archive/features";
import { trailData } from "@/lib/archive/trail";

const TRAIL = [{ name: "Home", href: "/" }, { name: "Living ships" }];

export const metadata: Metadata = {
  title:
    "No Man's Sky living ships: every shape of a living ship — Atlas Archive",
  alternates: { canonical: "/living-ship-finder" },
  description:
    "Living ships in No Man's Sky: put a living ship together from its head, underside, wings, and parts, and see every shape the game makes.",
};

// Hidden until 3.0: the page answers 404 while the feature flag is off.
export default async function LivingShipFinderPage() {
  if (!LIVING_SHIPS_ENABLED) {
    notFound();
  }
  return (
    <>
      <StructuredData data={trailData(TRAIL)} />
      <PageTrail steps={TRAIL} />
      <LivingShipFinder html={await readContent("living-ship-finder")} />
    </>
  );
}
