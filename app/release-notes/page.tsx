import type { Metadata } from "next";

import { AboutScreen } from "@/components/archive/AboutScreen";
import { readContent } from "@/lib/archive/content";

export const metadata: Metadata = {
  title: "Release notes — Atlas Archive",
  description: "What changed on Atlas Archive, release by release.",
};

export default async function ReleaseNotesPage() {
  return <AboutScreen html={await readContent("release-notes")} />;
}
