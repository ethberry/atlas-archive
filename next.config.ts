import { withSentryConfig } from "@sentry/nextjs/config";
import { readFileSync } from "node:fs";
import path from "node:path";

import type { NextConfig } from "next";

import { BASE_PATH, LEGACY_HOST } from "./lib/site";

// The guides menu the generator writes: each group and its guides.
const MENU: { slug: string; pages: { slug: string }[] }[] = JSON.parse(
  readFileSync(
    path.join(process.cwd(), "lib/archive/statistics-menu.json"),
    "utf8",
  ),
);

// Paths outside this section: the old address, the domain's root, and any path
// without the prefix. They go first, so a page reaches its new address before
// the older redirects of the guides below apply to it.
const SECTION_REDIRECTS = [
  // The site from before the move: every path to the same page on the new
  // domain. Built in only when the deploy sets LEGACY_HOST_REDIRECT, so the old
  // address keeps working until seedarchive.gg answers.
  ...(process.env.LEGACY_HOST_REDIRECT
    ? [
        {
          source: `${BASE_PATH}/:path*`,
          has: [{ type: "host" as const, value: LEGACY_HOST }],
          destination: `https://seedarchive.gg${BASE_PATH}/:path*`,
          basePath: false as const,
          permanent: true,
        },
        {
          source: "/:path*",
          has: [{ type: "host" as const, value: LEGACY_HOST }],
          destination: `https://seedarchive.gg${BASE_PATH}/:path*`,
          basePath: false as const,
          permanent: true,
        },
      ]
    : []),
  // The root becomes the page of Seed Archive itself once there is more than
  // one game, so it leads to this section only for now.
  {
    source: "/",
    destination: BASE_PATH,
    basePath: false as const,
    permanent: false,
  },
  // Every other path without the prefix: the old links of the site, the 469
  // links written into content/ and the pictures of public/ named by plain
  // paths in HTML, stylesheets and statistics.json. Next.js prefixes only its
  // own links (next/link, redirect, router), not a path written as text.
  // /_vercel/ is Vercel's own (Web Analytics), never redirected.
  {
    source: `/:path((?!${BASE_PATH.slice(1)}(?:/|$)|_vercel/).+)`,
    destination: `${BASE_PATH}/:path`,
    basePath: false as const,
    permanent: true,
  },
];

const nextConfig: NextConfig = {
  basePath: BASE_PATH,
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
      ...SECTION_REDIRECTS,
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
      // Excavation finds became the Fossil Collector's guide on 2026-11-11.
      ...[
        "/statistics/excavation-finds",
        "/guides/excavation-finds",
        "/guides/planets/excavation-finds",
      ].map((source) => ({
        source,
        destination: long("fossil-collector"),
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
