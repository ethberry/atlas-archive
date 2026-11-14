import type { MetadataRoute } from "next";

import { BASE_PATH } from "@/lib/site";

// Served at /no-mans-sky/robots.txt; the domain's /robots.txt redirects here
// (next.config.ts). Its rules name paths from the root of the domain.
export default function robots(): MetadataRoute.Robots {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ?? `http://localhost:3000${BASE_PATH}`;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [`${BASE_PATH}/likes`],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
