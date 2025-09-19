"use client";

import { FC } from "react";
import Image from "next/image";

export const Egg: FC = () => {
  return (
    <section className="relative w-full h-screen flex items-center justify-center snap-start px-4 md:px-8 bg-transparent">
      <div className="relative w-full max-w-[60%] md:max-w-[400px]">
        <Image
          src={"/assets/magnific_9.jpeg"}
          width={400}
          height={185}
          alt="Fabergé Egg"
          className="relative z-10 w-full rounded-lg shadow-2xl object-cover"
        />
      </div>
    </section>
  );
};
