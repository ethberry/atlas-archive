import { consoleLoggingIntegration } from "@sentry/core";
import {
  captureRouterTransitionStart,
  init,
  replayIntegration,
} from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  init({
    dsn,
    integrations: [replayIntegration(), consoleLoggingIntegration()],
    tracesSampleRate: 1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    debug: false,
  });
}

export const onRouterTransitionStart = captureRouterTransitionStart;
