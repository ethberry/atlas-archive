import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pages read content/ at run time, so Vercel has to ship it.
  outputFileTracingIncludes: { "/**": ["./content/**"] },
  // Statistics became Guides on 2026-11-03.
  async redirects() {
    return [
      { source: "/statistics", destination: "/guides", permanent: true },
      {
        source: "/statistics/:slug",
        destination: "/guides/:slug",
        permanent: true,
      },
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
