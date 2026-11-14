// Seed Archive serves each game under its own section of one domain:
// seedarchive.gg/no-mans-sky/… This app is the No Man's Sky section. Next.js
// prefixes its own links (next/link, redirect, router) with it; a raw path
// written into HTML or a stylesheet does not get it (see next.config.ts).
export const BASE_PATH = "/no-mans-sky";

// The address the site had before the move to seedarchive.gg.
export const LEGACY_HOST = "atlas-archive-tau.vercel.app";
