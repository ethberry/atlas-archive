"use client";

import { FC, memo, useCallback, useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormattedMessage } from "react-intl";

export const HeroSection: FC = memo(() => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);

  const handleLearnMore = useCallback(() => {
    router.push("/saft");
  }, [router]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || videoError) return;

    const playVideo = async () => {
      try {
        video.muted = true;
        video.playsInline = true;
        video.loop = true;
        await video.play();
      } catch (error) {
        console.error("Video autoplay failed:", error);
        setVideoError(true);
      }
    };

    const handleError = () => {
      setVideoError(true);
    };

    video.addEventListener("error", handleError);

    void playVideo();

    const handleInteraction = () => {
      void playVideo();
    };

    document.addEventListener("click", handleInteraction, { once: true });
    document.addEventListener("touchstart", handleInteraction, { once: true });

    return () => {
      video.removeEventListener("error", handleError);
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
  }, [videoError]);

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center snap-start px-4 md:px-8 pt-12 md:pt-20 pb-12">
      <div className="relative z-10 flex flex-col items-center justify-center text-center text-white max-w-6xl mx-auto">
        <h1
          className="text-[46px] md:text-[70px] lg:text-[70px] text-white tracking-wide font-[600]"
          style={{ fontFamily: "var(--font-family-serif)" }}
        >
          <FormattedMessage id="pages.landing.title" />
        </h1>

        <div className="relative w-full max-w-[320px] md:max-w-[420px] my-6">
          {!videoError ? (
            <video
              ref={videoRef}
              width={420}
              height={400}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onError={() => {
                setVideoError(true);
              }}
              className="w-full h-auto"
              data-webkit-playsinline="true"
              data-x5-playsinline="true"
              data-x5-video-player-type="h5"
              data-x5-video-player-fullscreen="false"
              style={{
                objectFit: "contain",
                background: "transparent",
              }}
            >
              <source src="/assets/egg.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src="/assets/gifs/egg.gif"
              width={320}
              height={400}
              alt="Fabergé Egg"
              className="w-full h-auto max-w-[320px] md:max-w-[380px]"
            />
          )}
        </div>

        <h2
          className="text-[34px] md:text-[40px] lg:text-[40px] text-white max-w-2xl leading-[44px] font-[600] "
          style={{ fontFamily: "var(--font-family-serif)" }}
        >
          <FormattedMessage
            id="pages.landing.hero.mainTitle"
            values={{ br: () => <br /> }}
          />
        </h2>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-3xl mt-8 text-[20px] md:text-[22px]"
          style={{ fontFamily: "var(--font-family-sans)" }}
        >
          <div className="text-left">
            <p className="text-white text-[20px] md:text-[22px] lg:text-[22px] font-normal">
              <FormattedMessage
                id="pages.landing.hero.description1"
                values={{ br: () => <br /> }}
              />
            </p>
          </div>
          <div className="text-left">
            <p className="text-white text-[20px] md:text-[22px] lg:text-[22px] font-normal">
              <FormattedMessage id="pages.landing.hero.description2" />
            </p>
          </div>
          <div className="text-left ">
            <p className="text-white text-[20px] md:text-[22px] lg:text-[22px] font-normal">
              <FormattedMessage id="pages.landing.hero.description3" />
            </p>
          </div>
          <div className="text-left ">
            <p className="text-white text-[20px] md:text-[22px] lg:text-[22px] font-normal">
              <FormattedMessage id="pages.landing.hero.description4" />
            </p>
          </div>
        </div>

        <button
          onClick={handleLearnMore}
          className="mt-8 px-7 py-3 text-[20px] font-normal rounded-[30px] bg-linear-to-b from-[#060F79] to-[#3F479C] border-2 border-[#33399A] hover:border-[#33399A] hover:from-transparent hover:to-transparent text-white cursor-pointer"
          style={{ fontFamily: "var(--font-family-sans)" }}
        >
          <FormattedMessage id="pages.landing.hero.learnMore" />
        </button>
      </div>
    </section>
  );
});
