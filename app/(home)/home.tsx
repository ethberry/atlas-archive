"use client";

import { FC } from "react";

import {
  HeroSection,
  FeaturesSection,
  RoadmapTimeline,
  VideoSection,
  GalerySection,
  DiscordInvite,
  FAQSection,
} from "./components";

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
