"use client";

import { FC, useCallback } from "react";
import { FormattedMessage } from "react-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";

export const ThankYou: FC = () => {
  const router = useRouter();

  const handleBuyMore = useCallback(() => {
    router.push("/saft");
  }, [router]);

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Title */}
        <h1
          className="text-[46px] md:text-5xl lg:text-[70px] text-white tracking-wide font-normal text-center mb-8"
          style={{ fontFamily: "var(--font-family-serif)" }}
        >
          <FormattedMessage id="pages.thankYou.title" />
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
          />
        </div>

        {/* Subtitle */}
        <h2
          className="text-[34px] md:text-[40px] text-white font-normal mb-8 text-center"
          style={{ fontFamily: "var(--font-family-serif)" }}
        >
          <FormattedMessage id="pages.thankYou.subtitle" />
        </h2>

        {/* Content Paragraphs */}
        <div className="max-w-2xl space-y-6 text-center">
          <p
            className="text-lg md:text-xl text-white leading-relaxed"
            style={{ fontFamily: "var(--font-family-sans)" }}
          >
            <FormattedMessage id="pages.thankYou.paragraph1" />
          </p>

          <p
            className="text-lg md:text-xl text-white leading-relaxed"
            style={{ fontFamily: "var(--font-family-sans)" }}
          >
            <FormattedMessage id="pages.thankYou.paragraph2" />
          </p>

          <p
            className="text-lg md:text-xl text-white leading-relaxed"
            style={{ fontFamily: "var(--font-family-sans)" }}
          >
            <FormattedMessage id="pages.thankYou.paragraph3" />
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleBuyMore}
          className="mt-12 px-12 py-3 text-[28px] font-normal rounded-[30px] bg-gradient-to-b from-[#060F79] to-[#3F479C] border-2 border-transparent hover:border-[#33399A] hover:from-transparent hover:to-transparent text-white transition-all duration-300"
          style={{ fontFamily: "var(--font-family-sans)" }}
        >
          <FormattedMessage id="pages.thankYou.button" />
        </button>
      </div>
    </main>
  );
};
