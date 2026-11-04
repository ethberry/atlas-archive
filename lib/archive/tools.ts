import { pathShown } from "@/lib/archive/features";

// The finders, the builders, and the luck score: Tools in the menu and the footer,
// less a tool the feature flag hides.
export const TOOLS = [
  { href: "/interceptor-finder", id: "archive.interceptorFinder" },
  { href: "/capital-freighter-finder", id: "archive.capitalFreighterFinder" },
  { href: "/freighter-finder", id: "archive.freighterFinder" },
  { href: "/living-ship-finder", id: "archive.livingShipFinder" },
  { href: "/how-lucky-am-i", id: "archive.luckCalculator" },
].filter((tool) => pathShown(tool.href));
