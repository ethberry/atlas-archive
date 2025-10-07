"use client";

import { FC, memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FormattedMessage, useIntl } from "react-intl";

import { HexagonCard } from "./HexagonCard";

interface IFeatureItem {
  imageSrc: string;
  imageAlt: string;
  descriptionId: string;
  position: "left" | "right";
}

const FEATURES: IFeatureItem[] = [
  {
    imageSrc: "/assets/img/info-1.png",
    imageAlt: "Fabergé Egg - Fractional Ownership",
    descriptionId: "pages.landing.features.item1",
    position: "left",
  },
  {
    imageSrc: "/assets/img/info-2.png",
    imageAlt: "Fabergé Egg - Authenticity",
    descriptionId: "pages.landing.features.item2",
    position: "right",
  },
  {
    imageSrc: "/assets/img/info-3.png",
    imageAlt: "Fabergé Egg - Storage",
    descriptionId: "pages.landing.features.item3",
    position: "left",
  },
];

export const FeaturesSection: FC = memo(() => {
  const router = useRouter();
  const intl = useIntl();

  const handleLearnMore = useCallback(() => {
    router.push("/saft");
  }, [router]);

  return (
    <section className="relative w-full py-12 md:py-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Feature Cards */}
        <div className="space-y-12 md:space-y-16">
          {FEATURES.map((feature, index) => (
            <HexagonCard
              key={index}
              imageSrc={feature.imageSrc}
              imageAlt={feature.imageAlt}
              position={feature.position}
              description={
                <p
                  className="text-white text-[20px] md:text-[22px] lg:text-[22px] font-normal font-sans"
                  style={{ fontFamily: "var(--font-family-sans)" }}
                >
                  {intl.formatMessage({ id: feature.descriptionId })}
                </p>
              }
            />
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mt-16">
          <button
            onClick={handleLearnMore}
            className="px-7 py-3 text-[20px] font-normal rounded-[30px] bg-linear-to-b from-[#060F79] to-[#3F479C] border-2 border-[#33399A] hover:border-[#33399A] hover:from-transparent hover:to-transparent text-white cursor-pointer"
            style={{ fontFamily: "var(--font-family-sans)" }}
            aria-label="Learn more about conditions"
          >
            <FormattedMessage id="pages.landing.hero.learnMore" />
          </button>
        </div>
      </div>
    </section>
  );
});
