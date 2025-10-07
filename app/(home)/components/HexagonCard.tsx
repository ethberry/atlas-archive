"use client";

import { FC, ReactNode, memo } from "react";
import Image from "next/image";

interface IHexagonCardProps {
  imageSrc: string;
  imageAlt: string;
  description: ReactNode;
  position?: "left" | "right";
}

export const HexagonCard: FC<IHexagonCardProps> = memo(
  ({ imageSrc, imageAlt, description, position = "left" }) => {
    return (
      <div
        className={`flex flex-col md:${position === "right" ? "flex-row-reverse" : "flex-row"} items-center gap-6 md:gap-12 my-8`}
      >
        {/* Hexagon Image */}
        <div className="relative flex-shrink-0">
          <div className="relative w-[200px] h-[200px] md:w-[240px] md:h-[240px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src={imageSrc}
                width={240}
                height={240}
                alt={imageAlt}
                className="w-full h-full object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="flex-1 text-white text-[20px] md:text-[22px] leading-relaxed text-left">
          {description}
        </div>
      </div>
    );
  },
);
