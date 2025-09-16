import { captureRequestError, init } from "@sentry/nextjs";

export function register() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    allowUrls: [/https:\/\/ask\.heylina\.ai/],

    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
    sendDefaultPii: true,

    // ...

    // Note: if you want to override the automatic release value, do not set a
    // `release` value here - use the environment variable `SENTRY_RELEASE`, so
    // that it will also get attached to your source maps
  });
}

export const onRequestError = captureRequestError;
