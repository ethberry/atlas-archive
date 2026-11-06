import { withSentryConfig } from "@sentry/nextjs/config";
import { readFileSync } from "node:fs";
import path from "node:path";

import type { NextConfig } from "next";

// The guides menu the generator writes: each group and its guides.
const MENU: { slug: string; pages: { slug: string }[] }[] = JSON.parse(
  readFileSync(
    path.join(process.cwd(), "lib/archive/statistics-menu.json"),
    "utf8",
  ),
);

const nextConfig: NextConfig = {
  // Pages read content/ at run time, so Vercel has to ship it.
  outputFileTracingIncludes: { "/**": ["./content/**"] },
  // Statistics became Guides on 2026-11-03, and each guide moved under its
  // group on 2026-11-05: /guides/<slug> to /guides/<group>/<slug>. Where a
  // group and a guide share a word (galaxies, systems, freighters) the short
  // path is now the group's own page and leads to the guide from there.
  async redirects() {
    const long = (slug: string) => {
      const group = MENU.find((one) =>
        one.pages.some((page) => page.slug === slug),
      );
      return group ? `/guides/${group.slug}/${slug}` : "/guides";
    };
    const groups = new Set(MENU.map((group) => group.slug));
    const guides = MENU.flatMap((group) =>
      group.pages.map((page) => page.slug),
    );
    return [
      { source: "/statistics", destination: "/guides", permanent: true },
      // The guide was Station upgrade modules until 2026-11-05.
      ...["statistics", "guides"].map((root) => ({
        source: `/${root}/station-upgrades`,
        destination: long("technology-merchants"),
        permanent: true,
      })),
      // Frigate traits became a section of Frigates on 2026-11-07.
      ...[
        "/statistics/frigate-traits",
        "/guides/frigate-traits",
        "/guides/freighters/frigate-traits",
      ].map((source) => ({
        source,
        destination: `${long("frigates")}#frigate-traits`,
        permanent: true,
      })),
      ...guides.map((slug) => ({
        source: `/statistics/${slug}`,
        destination: long(slug),
        permanent: true,
      })),
      ...guides
        .filter((slug) => !groups.has(slug))
        .map((slug) => ({
          source: `/guides/${slug}`,
          destination: long(slug),
          permanent: true,
        })),
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  webpack: {
    automaticVercelMonitors: false,
  },
});
