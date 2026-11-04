import type { Metadata } from "next";

import { Article } from "@/components/archive/Article";
import { readContent } from "@/lib/archive/content";

export const metadata: Metadata = {
  title: "Release notes — Atlas Archive",
  alternates: { canonical: "/release-notes" },
  description: "What changed on Atlas Archive, release by release.",
};

// A page of text: the shared Article, with no widgets of another page.
export default async function ReleaseNotesPage() {
  return <Article html={await readContent("release-notes")} widgets={{}} />;
}
