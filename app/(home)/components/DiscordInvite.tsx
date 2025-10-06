"use client";

import { FC, memo } from "react";
import { FormattedMessage } from "react-intl";
import Image from "next/image";

export const DiscordInvite: FC = memo(() => {
  return (
    <section className="relative w-full py-16 md:py-24 px-4 md:px-0 bg-[#0D0925]">
      {/* Stars background - Grid pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Generate stars in a grid */}
        {Array.from({ length: 10 }).map((_, row) =>
          Array.from({ length: 12 }).map((_, col) => (
            <div
              key={`${row}-${col}`}
              className="absolute w-1 h-1 bg-white rounded-full opacity-60"
              style={{
                left: `${(col * 100) / 11}%`,
                top: `${(row * 100) / 9}%`,
                animation: `twinkle ${2 + ((row + col) % 3)}s ease-in-out infinite`,
                animationDelay: `${((row + col) % 4) * 0.5}s`,
              }}
            />
          )),
        )}
      </div>

      <div className="relative flex items-center justify-center">
        {/* Left Egg Image - can overflow section */}
        <div className="hidden lg:block absolute left-0 top-[40%] -translate-y-1/2 w-[244px] xl:w-[244px] pointer-events-none">
          <Image
            src="/assets/img/ds-2.png"
            width={244}
            height={465}
            alt="Fabergé Egg Left"
            className="w-full h-auto object-contain"
            priority
          />
        </div>

        {/* Center Content */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
          <h2
            className="text-[46px] lg:text-[50px] text-white font-normal font-serif"
            style={{ fontFamily: "var(--font-family-serif)" }}
          >
            <FormattedMessage id="pages.landing.discord.title" />
          </h2>

          <p
            className="text-[20px] md:text-[22px] text-gray-300 leading-relaxed text-center"
            style={{ fontFamily: "var(--font-family-sans)" }}
          >
            <FormattedMessage
              id="pages.landing.discord.subtitle"
              values={{ br: () => <br /> }}
            />
          </p>

          <a
            href="https://minisite.uno/discordfractown"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 px-12 py-3 text-[28px] font-normal rounded-[30px] bg-linear-to-b from-[#060F79] to-[#3F479C] border-transparent border-2 border-transparent hover:border-[#33399A] hover:from-transparent hover:to-transparent text-white"
            style={{ fontFamily: "var(--font-family-sans)" }}
          >
            <FormattedMessage id="pages.landing.discord.button" />
          </a>
        </div>

        {/* Right Egg Image - can overflow section */}
        <div className="hidden lg:block absolute right-0 top-[30%] -translate-y-1/2 w-[244px] xl:w-[244px] pointer-events-none">
          <Image
            src="/assets/img/ds-1.png"
            width={244}
            height={465}
            alt="Fabergé Egg Right"
            className="w-full h-auto object-contain"
            priority
          />
        </div>
      </div>
    </section>
  );
});

DiscordInvite.displayName = "DiscordInvite";
