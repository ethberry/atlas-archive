import { PropsWithChildren } from "react";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import localFont from "next/font/local";
import InitColorSchemeScript from "@mui/system/InitColorSchemeScript";
import { Analytics } from "@vercel/analytics/next";

import { Providers } from "@/components/providers/providers";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-manrope",
});

// Portal glyphs: the characters 0-9 and A-F draw the sixteen glyphs.
const glyphs = localFont({
  src: "../public/fonts/NMS-Glyphs-Mono.ttf",
  display: "block",
  variable: "--font-glyphs",
});

export const metadata: Metadata = {
  title: "Atlas Archive",
  description: "A catalogue of generated worlds, ships, tools, and creatures.",
};

export default function RootLayout(props: PropsWithChildren) {
  const { children } = props;

  return (
    <html
      lang="en"
      className={`${manrope.variable} ${glyphs.variable}`}
      suppressHydrationWarning
    >
      <body>
        <InitColorSchemeScript attribute="class" />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
