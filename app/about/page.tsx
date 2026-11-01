import type { Metadata } from "next";

import { AboutScreen } from "@/components/archive/AboutScreen";
import { fillNumbers } from "@/lib/archive/about";
import { readContent } from "@/lib/archive/content";

export const metadata: Metadata = {
  title: "How it works — Atlas Archive",
  alternates: { canonical: "/about" },
  description:
    "How a galaxy of trillions of stars narrows to a short list of multitools and crashed ships per system.",
};

export default async function AboutPage() {
  return <AboutScreen html={fillNumbers(await readContent("about"))} />;
}
