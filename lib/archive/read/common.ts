import * as Sentry from "@sentry/nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Kind } from "@/lib/archive/kinds";
import { listRowSchema } from "@/lib/archive/schema";
import type { Database } from "@/lib/db/supabase.types";
import type { Step } from "@/lib/archive/read/route";

const UNAVAILABLE = "The archive could not be read.";

export type ArchiveClient = SupabaseClient<Database>;

export type CatalogRow = {
  id: string;
  kind: Kind;
  name: string;
  likeCount: number;
  liked: boolean;
  // The card picture of a home-page row; null shows the placeholder.
  image?: string | null;
};

export type CatalogPage = {
  rows: CatalogRow[];
  total: number | null;
  hasNext: boolean;
};

export type Field =
  | { type: "text"; label: string; text: string | null; href?: string }
  | { type: "steps"; label: string; glyphs: string | null; steps: Step[] }
  | { type: "glyphs"; label: string; glyphs: string | null }
  | {
      type: "slots";
      label: string;
      width: number;
      height: number;
      cells: SlotCell[];
    }
  | { type: "term"; label: string; group: string; value: string | null }
  | { type: "terms"; label: string; group: string; values: string[] }
  | { type: "flag"; label: string; value: boolean | null };

// One supercharged cell and the class at which it is open.
export type SlotCell = { column: number; row: number; rank: string };

export type AssetCard = {
  id: string;
  kind: Kind;
  name: string;
  likeCount: number;
  liked: boolean;
  // Checked in the game; set by hand in the database. Null for kinds that
  // carry no mark.
  verified: boolean | null;
  // The record's pictures; none shows the placeholder.
  images: string[];
  // Whether a player can add a screenshot to this record.
  uploadable: boolean;
  // The records above this one, from the galaxy down.
  trail: TrailStep[];
  fields: Field[];
};

export type TrailStep = { id: string; kind: Kind; name: string };

// Galaxies with a picture in public/assets/img/galaxies, by index.
const GALAXY_IMAGES = new Set([0, 1, 2, 6, 9, 245]);

export function galaxyImage(index: unknown): string | null {
  return typeof index === "number" && GALAXY_IMAGES.has(index)
    ? `/assets/img/galaxies/${index}.jpg`
    : null;
}

export type AssetHead = {
  id: string;
  kind: string;
  name: string;
  locator: string | null;
  like_count: number;
};

export function contains(value: string): string {
  return `%${value.replace(/[%_\\]/g, "\\$&")}%`;
}

export function fail(cause: unknown): never {
  Sentry.captureException(cause);
  throw new Error(UNAVAILABLE, { cause });
}

export async function likedSet(
  supabase: ArchiveClient,
  ids: string[],
): Promise<Set<string>> {
  if (ids.length === 0) {
    return new Set();
  }
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return new Set();
  }
  const { data, error } = await supabase
    .from("likes")
    .select("asset_id")
    .in("asset_id", ids);
  if (error) {
    fail(error);
  }
  return new Set((data ?? []).map((row) => row.asset_id));
}

export function toRows(data: unknown, liked: Set<string>): CatalogRow[] {
  const parsed = listRowSchema.array().safeParse(data);
  if (!parsed.success) {
    fail(parsed.error);
  }
  return parsed.data.map((row) => ({
    id: row.id,
    kind: row.kind,
    name: row.name,
    likeCount: row.like_count,
    liked: liked.has(row.id),
  }));
}

// A station has the name of its system.
export function stationName(system: string): string {
  return `${system} (Station)`;
}

export function rows(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

export function term(
  label: string,
  group: string,
  value: string | null,
): Field {
  return { type: "term", label, group, value };
}

// A list of loc-key values shown by their translations.
export function terms(label: string, group: string, value: unknown): Field {
  return {
    type: "terms",
    label,
    group,
    values: Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [],
  };
}

export function flag(label: string, value: boolean | null): Field {
  return { type: "flag", label, value };
}

export function asRecord(value: unknown): Record<string, unknown> {
  const target = Array.isArray(value) ? value[0] : value;
  if (!target || typeof target !== "object") {
    return {};
  }
  return Object.fromEntries(
    Object.entries(target).map(([key, item]) => [key, item as unknown]),
  );
}

export function text(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function bool(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

export function numberText(value: unknown): string | null {
  return typeof value === "number" ? String(value) : null;
}
