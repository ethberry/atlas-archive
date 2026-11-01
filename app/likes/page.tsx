import { LikesScreen } from "@/components/archive/LikesScreen";
import { parseCatalogQuery } from "@/lib/archive/query";

type Search = Record<string, string | string[] | undefined>;

export default async function LikesPage(props: {
  searchParams: Promise<Search>;
}) {
  const query = parseCatalogQuery(
    ["tool", "creature", "ship"],
    await props.searchParams,
  );
  return <LikesScreen query={query} />;
}
