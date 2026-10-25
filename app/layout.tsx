import { PropsWithChildren } from "react";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import InitColorSchemeScript from "@mui/system/InitColorSchemeScript";

import { Providers } from "@/components/providers/providers";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Atlas Archive",
  description: "A catalogue of generated worlds, ships, tools, and creatures.",
};

export default function RootLayout(props: PropsWithChildren) {
  const { children } = props;

  return (
    <html lang="en" className={manrope.variable} suppressHydrationWarning>
      <body>
        <InitColorSchemeScript attribute="class" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
