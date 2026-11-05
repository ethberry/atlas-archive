import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InterceptorFinder } from "@/components/archive/InterceptorFinder";
import { PageTrail } from "@/components/archive/PageTrail";
import { StructuredData } from "@/components/archive/StructuredData";
import { readContent } from "@/lib/archive/content";
import { INTERCEPTOR_FINDER_ENABLED } from "@/lib/archive/features";
import { trailData } from "@/lib/archive/trail";

const TRAIL = [
  { name: "Home", href: "/" },
  { name: "Sentinel Interceptor builder" },
];

export const metadata: Metadata = {
  title:
    "No Man's Sky Interceptor builder: every Sentinel Interceptor, part by part — Atlas Archive",
  alternates: { canonical: "/interceptor-finder" },
  description:
    "Build a No Man's Sky Sentinel Interceptor from every part the game can give it: the cockpit, the wings, the hull, the skirting, and the colour.",
};

// Hidden while its finder flag is off: the page answers 404.
export default async function InterceptorFinderPage() {
  if (!INTERCEPTOR_FINDER_ENABLED) {
    notFound();
  }
  return (
    <>
      <StructuredData data={trailData(TRAIL)} />
      <PageTrail steps={TRAIL} />
      <InterceptorFinder html={await readContent("interceptor-finder")} />
    </>
  );
}
