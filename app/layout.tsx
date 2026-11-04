import { PropsWithChildren } from "react";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import localFont from "next/font/local";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
  ),
  title: "Best items in No Man's Sky and where to find them — Atlas Archive",
  description:
    "Where to find the best multitools, crashed ships, and creatures in No Man's Sky: finds with portal glyphs, and guides from the galaxy down to the planet.",
  openGraph: {
    siteName: "Atlas Archive",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  verification: {
    google: "5bJVHey_Y1j3CNcU_hjDHzvmgn248Hw1bSvkQxQiJ6g",
  },
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
