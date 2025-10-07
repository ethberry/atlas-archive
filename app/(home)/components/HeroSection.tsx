"use client";

import { FC, memo, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormattedMessage } from "react-intl";

export const HeroSection: FC = memo(() => {
  const router = useRouter();

  const handleLearnMore = useCallback(() => {
    router.push("/saft");
  }, [router]);

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center snap-start px-4 md:px-8 pt-12 md:pt-20 pb-12">
      <div className="relative z-10 flex flex-col items-center justify-center text-center text-white space-y-6 md:space-y-10 max-w-6xl mx-auto">
        {/* Title */}
        <h1
          className="text-[46px] md:text-5xl lg:text-[70px] text-white tracking-wide font-normal"
          style={{ fontFamily: "var(--font-family-serif)" }}
        >
          <FormattedMessage id="pages.landing.title" />
        </h1>

        {/* Egg Image */}
        <div className="relative w-full max-w-[320px] md:max-w-[380px] my-6">
          <Image
            src="/assets/gifs/egg.gif"
            width={380}
            height={400}
            alt="Fabergé Egg"
            className="w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
            priority
            unoptimized
          />
        </div>

        {/* Subtitle */}
        <h2
          className="text-[34px] md:text-[34px] lg:text-[34px] text-white max-w-2xl leading-tight font-normal"
          style={{ fontFamily: "var(--font-family-serif)" }}
        >
          <FormattedMessage
            id="pages.landing.hero.mainTitle"
            values={{ br: () => <br /> }}
          />
        </h2>

        {/* Three columns description */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-3xl mt-8 text-[20px] md:text-[22px]"
          style={{ fontFamily: "var(--font-family-sans)" }}
        >
          <div className="text-left">
            <p className="text-gray-300 leading-relaxed">
              <FormattedMessage id="pages.landing.hero.description1" />
            </p>
          </div>
          <div className="text-left">
            <p className="text-gray-300 leading-relaxed">
              <FormattedMessage id="pages.landing.hero.description2" />
            </p>
          </div>
          <div className="text-left ">
            <p className="text-gray-300 leading-relaxed">
              <FormattedMessage id="pages.landing.hero.description3" />
            </p>
          </div>
          <div className="text-left ">
            <p className="text-gray-300 leading-relaxed">
              <FormattedMessage id="pages.landing.hero.description4" />
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleLearnMore}
          className="mt-8 px-12 py-3 text-[28px] font-normal rounded-[30px] bg-linear-to-b from-[#060F79] to-[#3F479C] border-transparent border-2 border-transparent hover:border-[#33399A] hover:from-transparent hover:to-transparent text-white"
          style={{ fontFamily: "var(--font-family-sans)" }}
        >
          <FormattedMessage id="pages.landing.hero.learnMore" />
        </button>
      </div>
    </section>
  );
});
