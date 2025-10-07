import { PropsWithChildren } from "react";
import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import { Providers } from "../components/providers/providers";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-family-serif",
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-family-sans",
});

export const metadata: Metadata = {
  title: "Fractown — Инвестируй в будущее, владея прошлым",
  description:
    "Стань совладельцем Яйца Фаберже — легенды искусства и символа роскоши. Fractown открывает доступ к уникальным артефактам через цифровые доли.",
  openGraph: {
    locale: "ru_RU",
    siteName: "Fractown",
    title: "Инвестируй в будущее, владея прошлым",
    description:
      "Стань совладельцем Яйца Фаберже — легенды искусства и символа роскоши. Fractown открывает доступ к уникальным артефактам через цифровые доли.",
    images: `${process.env.NEXT_PUBLIC_BASE_URL}/assets/fractown-og-img.png`,
    type: "website",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Инвестируй в будущее, владея прошлым",
    description:
      "Стань совладельцем Яйца Фаберже — легенды искусства и символа роскоши. Fractown открывает доступ к уникальным артефактам через цифровые доли.",
    images: `${process.env.NEXT_PUBLIC_BASE_URL}/assets/fractown-og-img.png`,
  },
};

export default function RootLayout(props: PropsWithChildren) {
  const { children } = props;

  return (
    <html
      lang="en"
      className={`dark ${cormorantGaramond.variable} ${manrope.variable}`}
    >
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-5BVJ2PSD9D"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-5BVJ2PSD9D');
          `,
          }}
        />
      </head>
      <body>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
