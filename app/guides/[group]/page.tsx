import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageTrail } from "@/components/archive/PageTrail";
import { TopicList } from "@/components/archive/StatisticsScreen";
import { StructuredData } from "@/components/archive/StructuredData";
import { guideQuestions } from "@/lib/archive/content";
import { GUIDE_MENU } from "@/lib/archive/features";
import { groupPath } from "@/lib/archive/guides";
import { TOPICS } from "@/lib/archive/statistics";
import { trailData } from "@/lib/archive/trail";

// A group's own page: its guides, each with its question and short answer. It
// tells nothing of its own (the owner, 2026-11-05) and stands outside the
// trail of the guides, which goes from the last guide of a group straight to
// the first of the next.

type Props = { params: Promise<{ group: string }> };

export const dynamicParams = false;

const groupOf = (slug: string) => GUIDE_MENU.find((one) => one.slug === slug);

export function generateStaticParams() {
  return GUIDE_MENU.map((group) => ({ group: group.slug }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const group = groupOf((await props.params).group);
  return group
    ? {
        title: `${group.title} guides for No Man's Sky — Atlas Archive`,
        description: `${group.title} in No Man's Sky: ${group.pages
          .map((page) => page.title.toLowerCase())
          .join(", ")}.`,
        alternates: { canonical: groupPath(group.slug) },
      }
    : {};
}

export default async function GroupPage(props: Props) {
  const group = groupOf((await props.params).group);
  if (!group) {
    notFound();
  }
  const trail = [
    { name: "Home", href: "/" },
    { name: "Guides", href: "/guides" },
    { name: group.title },
  ];
  const questions = await guideQuestions(group.pages.map((page) => page.slug));
  return (
    <>
      <StructuredData data={trailData(trail)} />
      <PageTrail steps={trail} />
      <TopicList topics={TOPICS} questions={questions} group={group.slug} />
    </>
  );
}
