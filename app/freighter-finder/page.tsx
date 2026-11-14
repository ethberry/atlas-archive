import type { Metadata } from "next";

import { RegularFreighterFinder } from "@/components/archive/RegularFreighterFinder";
import { PageTrail } from "@/components/archive/PageTrail";
import { StructuredData } from "@/components/archive/StructuredData";
import { readContent } from "@/lib/archive/content";
import { trailData } from "@/lib/archive/trail";

const TRAIL = [{ name: "Home", href: "/" }, { name: "Regular freighters" }];

export const metadata: Metadata = {
  title:
    "No Man's Sky regular freighters: every shape of a regular freighter — Atlas Archive",
  alternates: { canonical: "/freighter-finder" },
  description:
    "Regular freighters in No Man's Sky: put a regular freighter together from its hull, length, and parts, and see every shape the game makes. Fleets bring each shape to any system.",
};

export default async function FreighterFinderPage() {
  return (
    <>
      <StructuredData data={trailData(TRAIL)} />
      <PageTrail steps={TRAIL} />
      <RegularFreighterFinder html={await readContent("freighter-finder")} />
    </>
  );
}
