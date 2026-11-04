import type { Metadata } from "next";

import { LuckCalculator } from "@/components/archive/LuckCalculator";
import { PageTrail } from "@/components/archive/PageTrail";
import { StructuredData } from "@/components/archive/StructuredData";
import { readContent } from "@/lib/archive/content";
import { trailData } from "@/lib/archive/trail";

const TRAIL = [{ name: "Home", href: "/" }, { name: "How lucky am I?" }];

export const metadata: Metadata = {
  title:
    "How lucky am I? Rate your No Man's Sky multitool or ship — Atlas Archive",
  alternates: { canonical: "/how-lucky-am-i" },
  description:
    "Enter a No Man's Sky multitool, staff, or claimed ship, with its supercharged slots and stats, and see how it ranks from 0 to 100.",
};

export default async function HowLuckyPage(props: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await props.searchParams;
  return (
    <>
      <StructuredData data={trailData(TRAIL)} />
      <PageTrail steps={TRAIL} />
      <LuckCalculator html={await readContent("how-lucky-am-i")} tab={tab} />
    </>
  );
}
