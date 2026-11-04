import type { Metadata } from "next";

import { AboutScreen } from "@/components/archive/AboutScreen";
import { fillNumbers } from "@/lib/archive/about";
import { readContent } from "@/lib/archive/content";

export const metadata: Metadata = {
  title:
    "How the best multitool is found: adjacent supercharged slots — Atlas Archive",
  alternates: { canonical: "/about" },
  description:
    "How a galaxy of trillions of stars narrows to a short list of multitools and crashed ships per system, and why four adjacent supercharged slots matter most.",
};

export default async function AboutPage() {
  return <AboutScreen html={fillNumbers(await readContent("about"))} />;
}
