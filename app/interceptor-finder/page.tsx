import type { Metadata } from "next";

import { InterceptorFinder } from "@/components/archive/InterceptorFinder";
import { PageTrail } from "@/components/archive/PageTrail";
import { StructuredData } from "@/components/archive/StructuredData";
import { readContent } from "@/lib/archive/content";
import { trailData } from "@/lib/archive/trail";

const TRAIL = [{ name: "Home", href: "/" }, { name: "Sentinel Interceptors" }];

export const metadata: Metadata = {
  title:
    "No Man's Sky Sentinel Interceptors: every Interceptor, part by part — Atlas Archive",
  alternates: { canonical: "/interceptor-finder" },
  description:
    "Put together a No Man's Sky Sentinel Interceptor from every part the game can give it: the cockpit, the wings, the hull, the skirting, and the colour.",
};

export default async function InterceptorFinderPage() {
  return (
    <>
      <StructuredData data={trailData(TRAIL)} />
      <PageTrail steps={TRAIL} />
      <InterceptorFinder html={await readContent("interceptor-finder")} />
    </>
  );
}
