import type { Kind } from "@/lib/archive/kinds";

// The Statistics page that explains a card's field, by the field's label. The
// label is the link's text, so each one appears on its page. A base stat leads
// to its own section of the stats guide.
const STATISTICS: Partial<Record<Kind, Record<string, string>>> = {
  galaxy: { "archive.galaxyType": "galaxies" },
  system: {
    "archive.star": "systems",
    "archive.station": "systems",
    "archive.population": "races",
    "archive.economy": "economy",
    "archive.wealth": "economy",
    "archive.conflict": "economy",
    "archive.dissonance": "sentinels-and-dissonance",
  },
  planet: {
    "archive.biome": "sources-by-type",
    "archive.sentinels": "sentinels-and-dissonance",
    "archive.dissonance": "sentinels-and-dissonance",
  },
  ship: {
    "archive.hull": "ship-types",
    "archive.rank": "ship-classes",
    "archive.supercharged": "ship-figures",
    "archive.baseDamage": "ship-stats#damage",
    "archive.baseShield": "ship-stats#shield",
    "archive.baseHyperdrive": "ship-stats#hyperdrive",
    "archive.baseAgile": "ship-stats#maneuverability",
  },
  tool: {
    "archive.toolBody": "multitool-types",
    "archive.headItem": "staffs",
    "archive.rank": "multitool-classes",
    "archive.supercharged": "figures",
    "archive.baseDamage": "multitool-stats#damage",
    "archive.baseMining": "multitool-stats#mining",
    "archive.baseScanner": "multitool-stats#scanner",
  },
  creature: {
    "archive.combat": "creature-stats",
    "archive.agility": "creature-stats",
    "archive.health": "creature-stats",
    "archive.affinity": "creature-affinity",
    "archive.habitat": "creature-roles",
    "archive.activeTime": "creature-roles",
  },
};

export function explainHref(kind: Kind, label: string) {
  const slug = STATISTICS[kind]?.[label];
  return slug ? `/guides/${slug}` : undefined;
}
