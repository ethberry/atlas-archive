"use client";

import { FC, memo, useState } from "react";
import Image from "next/image";

import { useAppStore } from "@/components/providers/AppStoreProvider";
import { EnabledLanguages } from "@/lib/i18n";

const VIDEO_IDS = {
  [EnabledLanguages.RU]: "Zp6YUrtJS64",
  [EnabledLanguages.EN]: "BFvQj2eF38Y",
};

export const VideoSection: FC = memo(() => {
  const { language } = useAppStore((state) => state);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const videoId = VIDEO_IDS[language];
  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  const handlePlayClick = () => {
    setIsVideoLoaded(true);
  };

  return (
    <section className="relative w-full py-16 md:py-24 px-4 md:px-8 bg-transparent">
      <div className="max-w-4xl mx-auto">
        <div className="relative w-full aspect-[9/16] max-w-[400px] mx-auto rounded-2xl overflow-hidden border-2 border-[#33399A] shadow-2xl bg-[#0D0925]">
          {!isVideoLoaded ? (
            <button
              onClick={handlePlayClick}
              className="relative w-full h-full group cursor-pointer"
              aria-label="Play video"
            >
              {!thumbnailError ? (
                <Image
                  src={thumbnailUrl}
                  alt="Video thumbnail"
                  fill
                  className="object-cover"
                  sizes="(max-width: 400px) 100vw, 400px"
                  quality={75}
                  priority={false}
                  onError={() => setThumbnailError(true)}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f4d] to-[#0D0925] flex items-center justify-center">
                  <div className="text-white text-center p-4">
                    <div className="text-6xl mb-4">🎬</div>
                    <div className="text-lg">Click to watch video</div>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                  <svg
                    className="w-10 h-10 text-white ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </button>
          ) : (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          )}
        </div>
      </div>
    </section>
  );
});
