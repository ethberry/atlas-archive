import type { Metadata } from "next";

import { Article } from "@/components/archive/Article";
import { PageTrail } from "@/components/archive/PageTrail";
import { TopicList } from "@/components/archive/StatisticsScreen";
import { StructuredData } from "@/components/archive/StructuredData";
import { readContent } from "@/lib/archive/content";
import { fillStatistics, TOPICS } from "@/lib/archive/statistics";
import { trailData } from "@/lib/archive/trail";

const TRAIL = [{ name: "Home", href: "/" }, { name: "Guides" }];

export const metadata: Metadata = {
  title: "No Man's Sky guides: where to find the best items — Atlas Archive",
  alternates: { canonical: "/guides" },
  description:
    "No Man's Sky guides, from the galaxy down to the creature: where to find S-class multitools, ships, freighters, upgrade modules, and creatures, and how rare each one is.",
};

export default async function GuidesPage() {
  const html = fillStatistics(await readContent("statistics"), "index");
  return (
    <>
      <StructuredData data={trailData(TRAIL)} />
      <PageTrail steps={TRAIL} />
      <Article html={html} widgets={{}} />
      <TopicList topics={TOPICS} />
    </>
  );
}
