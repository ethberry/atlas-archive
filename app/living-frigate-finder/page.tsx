import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LivingFrigateFinder } from "@/components/archive/LivingFrigateFinder";
import { PageTrail } from "@/components/archive/PageTrail";
import { StructuredData } from "@/components/archive/StructuredData";
import { readContent } from "@/lib/archive/content";
import { LIVING_SHIPS_ENABLED } from "@/lib/archive/features";
import { trailData } from "@/lib/archive/trail";

const TRAIL = [{ name: "Home", href: "/" }, { name: "Living frigates" }];

export const metadata: Metadata = {
  title:
    "No Man's Sky living frigates: every shape of an organic frigate — Atlas Archive",
  alternates: { canonical: "/living-frigate-finder" },
  description:
    "Living frigates in No Man's Sky: put a cosmic whale together from its front accessory, tail, wings, and side parts, and see every shape the game makes.",
};

// Hidden until 3.0: the page answers 404 while the feature flag is off.
export default async function LivingFrigateFinderPage() {
  if (!LIVING_SHIPS_ENABLED) {
    notFound();
  }
  return (
    <>
      <StructuredData data={trailData(TRAIL)} />
      <PageTrail steps={TRAIL} />
      <LivingFrigateFinder html={await readContent("living-frigate-finder")} />
    </>
  );
}
