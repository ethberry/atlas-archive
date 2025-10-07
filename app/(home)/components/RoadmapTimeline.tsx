"use client";

import { FC, memo } from "react";
import { FormattedMessage, useIntl } from "react-intl";

interface IRoadmapItemProps {
  periodId: string;
  descriptionId: string;
  size?: "small" | "large";
}

const RoadmapItem: FC<IRoadmapItemProps> = memo(
  ({ periodId, descriptionId, size = "large" }) => {
    const intl = useIntl();

    return (
      <div className="flex-1 flex gap-4 md:flex-col md:items-start min-w-[280px] md:min-w-0 relative">
        {/* Hexagon - positioned to be on the line */}
        <div className="flex flex-col items-center relative z-10">
          {/* Hexagon - same size for both */}
          {size === "small" ? (
            <svg
              width="52"
              height="55"
              viewBox="0 0 52 55"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="ml-0 -mt-[20px] md:mt-0 md:-ml-[20px]"
            >
              <path
                d="M32.252 12.9263L45.2423 20.4263V35.4263L32.252 42.9263L19.2616 35.4263V20.4263L32.252 12.9263Z"
                fill="#353C87"
              />
              <g filter="url(#filter0_d_0_1)">
                <path
                  d="M32.252 17.9263L40.9122 22.9263V32.9263L32.252 37.9263L23.5917 32.9263V22.9263L32.252 17.9263Z"
                  fill="#0511D2"
                />
              </g>
            </svg>
          ) : (
            <svg
              width="52"
              height="55"
              viewBox="0 0 52 55"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M32.252 12.9263L45.2423 20.4263V35.4263L32.252 42.9263L19.2616 35.4263V20.4263L32.252 12.9263Z"
                fill="#353C87"
              />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 md:mt-6">
          {/* Period */}
          <h3
            className="text-white font-[500] text-[22px] leading-[26px] mb-4"
            style={{ fontFamily: "var(--font-family-sans)" }}
          >
            {intl.formatMessage({ id: periodId })}
          </h3>

          {/* Description */}
          <p
            className="text-white font-normal leading-6 max-w-[300px] text-[20px] md:text-[16px]"
            style={{ fontFamily: "var(--font-family-sans)" }}
          >
            {intl.formatMessage({ id: descriptionId })}
          </p>
        </div>
      </div>
    );
  },
);

export const RoadmapTimeline: FC = memo(() => {
  const roadmapItems = [
    {
      periodId: "pages.landing.roadmap.sep2025.period",
      descriptionId: "pages.landing.roadmap.sep2025.description",
      size: "small" as const,
    },
    {
      periodId: "pages.landing.roadmap.octNov2025.period",
      descriptionId: "pages.landing.roadmap.octNov2025.description",
      size: "large" as const,
    },
    {
      periodId: "pages.landing.roadmap.novDec2025.period",
      descriptionId: "pages.landing.roadmap.novDec2025.description",
      size: "large" as const,
    },
    {
      periodId: "pages.landing.roadmap.q1_2026.period",
      descriptionId: "pages.landing.roadmap.q1_2026.description",
      size: "large" as const,
    },
  ];

  return (
    <section className="relative w-full py-16 md:py-24 px-4 md:px-8 bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h2
          className="text-[46px] md:text-[50px] text-white text-center mb-20 font-[600] font-serif"
          style={{ fontFamily: "var(--font-family-serif)" }}
        >
          <FormattedMessage id="pages.landing.roadmap.title" />
        </h2>

        {/* Timeline Container */}
        <div className="relative">
          {/* Timeline Items */}
          <div className="relative flex flex-col md:flex-row md:items-start md:justify-between">
            {/* Horizontal line - Desktop only - continuous through all hexagons */}
            <div className="hidden md:block absolute left-0 right-0 top-[27px] h-[2px] bg-[#343C87] z-0" />

            {/* Vertical line - Mobile only - continuous through all hexagons */}
            <div className="md:hidden absolute left-[32px] top-0 bottom-0 w-[2px] bg-[#343C87] z-0" />

            <div className="flex flex-col md:flex-row gap-12 md:gap-8 md:items-start md:justify-between w-full">
              {roadmapItems.map((item, index) => (
                <RoadmapItem
                  key={index}
                  periodId={item.periodId}
                  descriptionId={item.descriptionId}
                  size={item.size}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
