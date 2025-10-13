import { PropsWithChildren } from "react";
import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import { Providers } from "@/components/providers/providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

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
  title: "Fractown — Turn Heritage into your future!",
  description: "Invest in masterpieces that never lose their shine.",
  openGraph: {
    locale: "en_US",
    siteName: "Fractown",
    title: "Turn Heritage into your future!",
    description: "Invest in masterpieces that never lose their shine.",
    images: `${process.env.NEXT_PUBLIC_BASE_URL}/assets/og-img.png`,
    type: "website",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Turn Heritage into your future!",
    description: "Invest in masterpieces that never lose their shine.",
    images: `${process.env.NEXT_PUBLIC_BASE_URL}/assets/og-img.png`,
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

        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1354668766001862');
              fbq('track', 'PageView');
          `,
          }}
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
              var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
              ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
              ttq.load('D3MGK8JC77UED425V5IG');
              ttq.page();
              }(window, document, 'ttq');
          `,
          }}
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
              },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
              a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
              twq('config','qe74y');
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
