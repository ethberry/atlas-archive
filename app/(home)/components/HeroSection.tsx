"use client";

import { FC, memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FormattedMessage } from "react-intl";

import { VideoWithFallback } from "@/components/VideoWithFallback";

export const HeroSection: FC = memo(() => {
  const router = useRouter();

  const handleLearnMore = useCallback(() => {
    router.push("/saft");
  }, [router]);

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center snap-start px-4 md:px-8 pt-12 md:pt-20 pb-12">
      <div className="relative z-10 flex flex-col items-center justify-center text-center text-white max-w-6xl mx-auto">
        <h1
          className="text-[46px] md:text-[70px] lg:text-[70px] text-white tracking-wide font-[600]"
          style={{ fontFamily: "var(--font-family-serif)" }}
        >
          <FormattedMessage id="pages.landing.title" />
        </h1>

        <VideoWithFallback />

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
          className="mt-8 px-7 py-3 text-[20px] font-normal rounded-[30px] bg-linear-to-b from-[#060F79] to-[#3F479C] border-2 border-[#33399A] hover:border-[#33399A] hover:from-transparent hover:to-transparent text-white cursor-pointer transition-colors duration-300"
          style={{ fontFamily: "var(--font-family-sans)" }}
        >
          <FormattedMessage id="pages.landing.hero.learnMore" />
        </button>
      </div>
    </section>
  );
});
