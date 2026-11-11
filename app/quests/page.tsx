import type { Metadata } from "next";

import { PageTrail } from "@/components/archive/PageTrail";
import { TopicList } from "@/components/archive/StatisticsScreen";
import { StructuredData } from "@/components/archive/StructuredData";
import { guideQuestions } from "@/lib/archive/content";
import { QUESTS_PATH, questPath } from "@/lib/archive/guides";
import { QUESTS } from "@/lib/archive/quests";
import { trailData } from "@/lib/archive/trail";

// The Quests section's own page: its pages, each with its question and short
// answer. Like a group of the guides, it tells nothing of its own.

const TITLE = "Quests";
const TRAIL = [{ name: "Home", href: "/" }, { name: TITLE }];

export const metadata: Metadata = {
  title: `${TITLE} in No Man's Sky — Atlas Archive`,
  description: `${TITLE} in No Man's Sky: ${QUESTS.map((quest) =>
    quest.title.toLowerCase(),
  ).join(", ")}.`,
  alternates: { canonical: QUESTS_PATH },
};

export default async function QuestsPage() {
  const questions = await guideQuestions(
    QUESTS.map((quest) => quest.slug),
    "quests",
  );
  return (
    <>
      <StructuredData data={trailData(TRAIL)} />
      <PageTrail steps={TRAIL} />
      <TopicList
        topics={QUESTS}
        questions={questions}
        section={{
          title: TITLE,
          pages: QUESTS.map((quest) => ({
            slug: quest.slug,
            title: quest.title,
            href: questPath(quest.slug),
          })),
        }}
      />
    </>
  );
}
