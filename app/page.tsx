import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { HomeScreen } from "@/components/archive/HomeScreen";
import { readContent } from "@/lib/archive/content";
import { readFeed, type FeedSection } from "@/lib/archive/read";
import { createArchiveClient } from "@/lib/db/supabase.server";
import { getQueryClient } from "@/lib/query-client";

export default async function Page() {
  const queryClient = getQueryClient();
  const supabase = await createArchiveClient();
  const sections: FeedSection[] = ["galaxies", "top", "latest"];
  if (supabase) {
    await Promise.all(
      sections.map((section) =>
        queryClient.prefetchQuery({
          queryKey: ["feed", section],
          queryFn: () => readFeed(supabase, section),
        }),
      ),
    );
  }

  const confession = await readContent("confession");

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeScreen confession={confession} />
    </HydrationBoundary>
  );
}
