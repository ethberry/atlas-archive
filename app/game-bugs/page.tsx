import type { Metadata } from "next";

import { Article } from "@/components/archive/Article";
import { readContent } from "@/lib/archive/content";

export const metadata: Metadata = {
  title: "No Man's Sky game bugs — Atlas Archive",
  alternates: { canonical: "/game-bugs" },
  description:
    "Bugs of No Man's Sky where a card says one thing and the game does another, and what each changes in what you farm.",
};

// A page of text: the shared Article, with no widgets of another page.
export default async function GameBugsPage() {
  return <Article html={await readContent("game-bugs")} widgets={{}} />;
}
