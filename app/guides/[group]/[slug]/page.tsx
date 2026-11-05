import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageTrail } from "@/components/archive/PageTrail";
import { TopicScreen } from "@/components/archive/StatisticsScreen";
import { StructuredData } from "@/components/archive/StructuredData";
import { fillCatalogExamples } from "@/lib/archive/catalog-examples";
import { readContent } from "@/lib/archive/content";
import {
  fillStatistics,
  tablesOf,
  topicOf,
  TOPICS,
} from "@/lib/archive/statistics";
import { chartsOf } from "@/lib/archive/statistics-charts";
import { groupOfGuide, groupPath, guidePath } from "@/lib/archive/guides";
import { articleData, trailData } from "@/lib/archive/trail";

type Props = { params: Promise<{ group: string; slug: string }> };

export const dynamicParams = false;

// The pages worth the most in search say their question in the title
// (docs/seo.md); the rest read "<title> in No Man's Sky".
const TITLES: Record<string, string> = {
  freighters: "How to get a class S capital freighter in No Man's Sky",
  "multitool-classes": "Where to find a class S multitool in No Man's Sky",
  "ship-classes": "How to find a class S crashed ship in No Man's Sky",
  interceptors: "How to get a Sentinel Interceptor in No Man's Sky",
  "living-ships": "How to get a living ship in No Man's Sky",
  "technology-merchants":
    "Technology merchants: where to buy class S upgrade modules in No Man's Sky",
  "freighter-modules": "How to farm class S freighter modules in No Man's Sky",
  galaxies: "Which galaxy is best in No Man's Sky",
  "where-to-look": "Where in a galaxy to look for class S items",
  staffs: "Which staff head to pick in No Man's Sky",
  economy: "Wealthy systems and economy in No Man's Sky",
};

export function generateStaticParams() {
  return TOPICS.map((topic) => ({
    group: groupOfGuide(topic.slug)?.slug ?? "",
    slug: topic.slug,
  }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { group, slug } = await props.params;
  const topic = topicOf(slug);
  return topic && groupOfGuide(slug)?.slug === group
    ? {
        title: `${TITLES[topic.slug] ?? `${topic.title} in No Man's Sky`} — Atlas Archive`,
        description: topic.fact,
        alternates: { canonical: guidePath(topic.slug) },
      }
    : {};
}

export default async function TopicPage(props: Props) {
  const { group: groupSlug, slug } = await props.params;
  const topic = topicOf(slug);
  const group = groupOfGuide(slug);
  if (!topic || !group || group.slug !== groupSlug) {
    notFound();
  }
  const trail = [
    { name: "Home", href: "/" },
    { name: "Guides", href: "/guides" },
    { name: group.title, href: groupPath(group.slug) },
    { name: topic.title },
  ];
  const html = await fillCatalogExamples(
    await readContent(`statistics/${slug}`),
  );
  return (
    <>
      <StructuredData data={trailData(trail)} />
      <StructuredData
        data={articleData(topic.title, topic.fact, guidePath(slug))}
      />
      <PageTrail steps={trail} />
      <TopicScreen
        html={fillStatistics(html, slug)}
        tables={tablesOf(slug)}
        charts={chartsOf(slug)}
      />
    </>
  );
}
