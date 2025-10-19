"use client";

import { FC, memo } from "react";

import { useAppStore } from "@/components/providers/AppStoreProvider";
import { EnabledLanguages } from "@/lib/i18n";

const VIDEO_URLS = {
  [EnabledLanguages.RU]: "https://www.youtube.com/embed/Zp6YUrtJS64",
  [EnabledLanguages.EN]: "https://www.youtube.com/embed/BFvQj2eF38Y",
};

export const VideoSection: FC = memo(() => {
  const { language } = useAppStore((state) => state);
  const videoUrl = VIDEO_URLS[language];

  return (
    <section className="relative w-full py-16 md:py-24 px-4 md:px-8 bg-transparent">
      <div className="max-w-4xl mx-auto">
        <div className="relative w-full aspect-[9/16] max-w-[400px] mx-auto rounded-2xl overflow-hidden border-2 border-[#33399A] shadow-2xl">
          <iframe
            src={videoUrl}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </div>
    </section>
  );
});
