"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { FormattedMessage } from "react-intl";
import Image from "next/image";

export default function NotFound() {
  const router = useRouter();

  const handleOwnFraction = useCallback(() => {
    router.push("/saft");
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content - takes remaining space */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="flex flex-col items-center text-center space-y-8 max-w-2xl mx-auto">
          {/* 404 GIF */}
          <div className="relative w-full max-w-[300px]">
            <Image
              src="/assets/gifs/404.gif"
              width={300}
              height={400}
              alt="404 Error"
              className="w-full h-auto"
              unoptimized
              priority
            />
          </div>

          {/* Error Text */}
          <div className="space-y-12 mb-12">
            <p
              className="text-[46px] md:text-[70px] text-white font-semibold"
              style={{ fontFamily: "var(--font-family-serif)" }}
            >
              <FormattedMessage id="pages.notFound.title" />
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleOwnFraction}
            className="px-12 py-2 text-[20px] md:text-[22px] font-normal rounded-[30px] bg-linear-to-b from-[#060F79] to-[#3F479C] border-2 border-[#33399A] hover:border-[#33399A] hover:from-transparent hover:to-transparent text-white cursor-pointer transition-colors duration-300"
            style={{ fontFamily: "var(--font-family-sans)" }}
          >
            <FormattedMessage id="pages.notFound.button" />
          </button>
        </div>
      </main>
    </div>
  );
}
