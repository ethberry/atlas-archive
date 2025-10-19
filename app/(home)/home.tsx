"use client";

import { FC } from "react";
import dynamic from "next/dynamic";

import {
  HeroSection,
  FeaturesSection,
  RoadmapTimeline,
  VideoSection,
  DiscordInvite,
  FAQSection,
} from "./components";

const GalerySection = dynamic(
  () =>
    import("./components/GalerySection").then((mod) => ({
      default: mod.GalerySection,
    })),
  {
    loading: () => (
      <div className="relative w-full py-16 md:py-24 px-4 md:px-8 bg-transparent overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin w-12 h-12 border-2 border-[#33399A] border-t-transparent rounded-full mx-auto mb-4"></div>
            <div className="text-lg">Loading gallery...</div>
          </div>
        </div>
      </div>
    ),
    ssr: false,
  },
);

export const Home: FC = () => {
  return (
    <main>
      <HeroSection />
      <VideoSection />
      <GalerySection />
      <FeaturesSection />
      <RoadmapTimeline />
      <DiscordInvite />
      <FAQSection />
    </main>
  );
};
