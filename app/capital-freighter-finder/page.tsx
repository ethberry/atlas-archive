import type { Metadata } from "next";

import { CapitalFreighterFinder } from "@/components/archive/CapitalFreighterFinder";
import { PageTrail } from "@/components/archive/PageTrail";
import { StructuredData } from "@/components/archive/StructuredData";
import { readContent } from "@/lib/archive/content";
import { trailData } from "@/lib/archive/trail";

const TRAIL = [{ name: "Home", href: "/" }, { name: "Capital freighters" }];

export const metadata: Metadata = {
  title:
    "No Man's Sky capital freighters: every capital freighter shape — Atlas Archive",
  alternates: { canonical: "/capital-freighter-finder" },
  description:
    "Pick the hull, length, and parts of a No Man's Sky capital freighter and see the ship the game builds.",
};

export default async function CapitalFreighterFinderPage() {
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
