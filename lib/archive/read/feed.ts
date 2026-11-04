import { FEED_KINDS } from "@/lib/archive/kinds";
import {
  type ArchiveClient,
  type CatalogRow,
  galaxyImage,
  fail,
  likedSet,
  toRows,
  asRecord,
} from "@/lib/archive/read/common";

export type FeedSection = "galaxies" | "top";

const FEATURED_GALAXIES = 4;

// Cards in a home-page block other than the galaxies.
const FEED_SIZE = 12;

async function readGalaxies(supabase: ArchiveClient): Promise<CatalogRow[]> {
  const { data, error } = await supabase
    .from("assets")
    .select("id, kind, name, like_count, galaxies!inner(featured, index)")
    .eq("kind", "galaxy")
    .not("galaxies.featured", "is", null)
    .limit(FEATURED_GALAXIES);
  if (error) {
    fail(error);
  }
  const order = new Map(
    (data ?? []).map((row) => [row.id, asRecord(row.galaxies).featured]),
  );
  const index = new Map(
    (data ?? []).map((row) => [row.id, asRecord(row.galaxies).index]),
  );
  const rows = toRows(data, new Set()).map((row) => ({
    ...row,
    image: galaxyImage(index.get(row.id)),
  }));
  rows.sort(
    (left, right) =>
      Number(order.get(left.id) ?? 0) - Number(order.get(right.id) ?? 0),
  );
  return rows;
}

export async function readFeed(
  supabase: ArchiveClient,
  section: FeedSection,
): Promise<CatalogRow[]> {
  if (section === "galaxies") {
    return readGalaxies(supabase);
  }
  const request = supabase
    .from("assets")
    .select("id, kind, name, like_count")
    .in("kind", [...FEED_KINDS])
    .limit(FEED_SIZE);

  const { data, error } = await request
    .order("like_count", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) {
    fail(error);
  }
  return withImages(
    supabase,
    await withLikes(supabase, toRows(data, new Set())),
  );
}

// The first checked screenshot of each row, for the home-page cards.
async function withImages(
  supabase: ArchiveClient,
  rows: CatalogRow[],
): Promise<CatalogRow[]> {
  const { data, error } = await supabase
    .from("asset_images")
    .select("asset_id, object_path")
    .in(
      "asset_id",
      rows.map((row) => row.id),
    )
    .eq("is_verified", true)
    .order("created_at", { ascending: true });
  if (error) {
    fail(error);
  }
  const first = new Map<string, string>();
  for (const row of data ?? []) {
    if (!first.has(row.asset_id)) {
      first.set(row.asset_id, row.object_path);
    }
  }
  if (first.size === 0) {
    return rows;
  }
  const signed = await supabase.storage
    .from("screenshots")
    .createSignedUrls([...first.values()], 3600);
  const links = new Map(
    (signed.data ?? []).map((row) => [row.path, row.signedUrl]),
  );
  return rows.map((row) => ({
    ...row,
    image: links.get(first.get(row.id) ?? "") ?? null,
  }));
}

async function withLikes(
  supabase: ArchiveClient,
  rows: CatalogRow[],
): Promise<CatalogRow[]> {
  const liked = await likedSet(
    supabase,
    rows.map((row) => row.id),
  );
  return rows.map((row) => ({ ...row, liked: liked.has(row.id) }));
}
