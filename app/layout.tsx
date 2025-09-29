import { PropsWithChildren } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Providers } from "../components/providers/providers";
import { Header } from "../components/Header";
import Footer from "../components/Footer";
import "./globals.css";

const font = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
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
    images: "https://fractown.com/assets/fractown-logo.png",
    type: "website",
    url: "https://fractown.com/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Инвестируй в будущее, владея прошлым",
    description:
      "Стань совладельцем Яйца Фаберже — легенды искусства и символа роскоши. Fractown открывает доступ к уникальным артефактам через цифровые доли.",
    images: "https://fractown.com/assets/fractown-logo.png",
  },
};

export default function RootLayout(props: PropsWithChildren) {
  const { children } = props;

  return (
    <html lang="en" className={"dark"}>
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
      <body className={`${font.variable}`}>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
