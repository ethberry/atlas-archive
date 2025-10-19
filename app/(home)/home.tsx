"use client";

import { FC } from "react";

import {
  HeroSection,
  FeaturesSection,
  RoadmapTimeline,
  GalerySection,
  DiscordInvite,
  FAQSection,
} from "./components";

export const Home: FC = () => {
  return (
    <main>
      <HeroSection />
      <GalerySection />
      <FeaturesSection />
      <RoadmapTimeline />
      <DiscordInvite />
      <FAQSection />
    </main>
  );
};
