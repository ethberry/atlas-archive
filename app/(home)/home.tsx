"use client";

import { FC } from "react";

import {
  HeroSection,
  FeaturesSection,
  RoadmapTimeline,
  DiscordInvite,
  FAQSection,
} from "./components";

export const Home: FC = () => {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <RoadmapTimeline />
      <DiscordInvite />
      <FAQSection />
    </main>
  );
};
