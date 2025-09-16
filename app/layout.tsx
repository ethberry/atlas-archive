import { PropsWithChildren } from "react";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import { Providers } from "../components/providers/providers";
import { Header } from "../components/Header";
import Footer from "../components/Footer";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "Fractown",
  description:
    "Explore the world of Web3 and the possibilities of land share ownership. Connect to our blockchain platform to acquire and manage digital assets. Join us today!",
  openGraph: {
    title: "Fractown",
    description:
      "Explore the world of Web3 and the possibilities of land share ownership. Connect to our blockchain platform to acquire and manage digital assets. Join us today!",
    images: "https://fractown.com/assets/fractown-logo.png",
  },
};

export default function RootLayout(props: PropsWithChildren) {
  const { children } = props;

  return (
    <html lang="en" className={"dark"}>
      <head></head>
      <body className={`${plusJakartaSans.variable}`}>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
