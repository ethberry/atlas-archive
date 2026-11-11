import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageTrail } from "@/components/archive/PageTrail";
import { TopicScreen } from "@/components/archive/StatisticsScreen";
import { StructuredData } from "@/components/archive/StructuredData";
import { readContent } from "@/lib/archive/content";
import { QUESTS_PATH, questPath } from "@/lib/archive/guides";
import { QUESTS, questOf } from "@/lib/archive/quests";
import { fillStatistics, tablesOf } from "@/lib/archive/statistics";
import { chartsOf } from "@/lib/archive/statistics-charts";
import { articleData, trailData } from "@/lib/archive/trail";

// One page of the Quests section, drawn as a guide is: its Markdown with the
// `{{name}}` numbers and `<!-- widget:KEY -->` tables of its page in
// statistics.json.

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return QUESTS.map((quest) => ({ slug: quest.slug }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const quest = questOf((await props.params).slug);
  return quest
    ? {
        title: `${quest.title} in No Man's Sky — Atlas Archive`,
        description: quest.fact,
        alternates: { canonical: questPath(quest.slug) },
      }
    : {};
}

export default async function QuestPage(props: Props) {
  const quest = questOf((await props.params).slug);
  if (!quest) {
    notFound();
  }
  const trail = [
    { name: "Home", href: "/" },
    { name: "Quests", href: QUESTS_PATH },
    { name: quest.title },
  ];
  const html = await readContent(`quests/${quest.slug}`);
  return (
    <>
      <StructuredData data={trailData(trail)} />
      <StructuredData
        data={articleData(quest.title, quest.fact, questPath(quest.slug))}
      />
      <PageTrail steps={trail} />
      <TopicScreen
        html={fillStatistics(html, quest.slug)}
        tables={tablesOf(quest.slug)}
        charts={chartsOf(quest.slug)}
      />
    </>
  );
}
