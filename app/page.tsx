import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { HomeScreen } from "@/components/archive/HomeScreen";
import { featuredIds } from "@/lib/archive/featured";
import { readFeed, type FeedSection } from "@/lib/archive/read";
import { createArchiveClient } from "@/lib/db/supabase.server";
import { getQueryClient } from "@/lib/query-client";

export default async function Page() {
  const queryClient = getQueryClient();
  const supabase = await createArchiveClient();
  const sections: FeedSection[] = ["featured", "top", "latest"];
  if (supabase) {
    await Promise.all(
      sections.map((section) =>
        queryClient.prefetchQuery({
          queryKey: ["feed", section],
          queryFn: () => readFeed(supabase, section),
        }),
      ),
    );
  } else if (featuredIds.length === 0) {
    queryClient.setQueryData(["feed", "featured"], []);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeScreen />
    </HydrationBoundary>
  );
}
