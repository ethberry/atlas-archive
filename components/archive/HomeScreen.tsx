"use client";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { useSnackbar } from "notistack";

import { CatalogList } from "@/components/archive/CatalogList";
import { featuredIds } from "@/lib/archive/featured";
import { readFeed, type FeedSection } from "@/lib/archive/read";
import { getBrowserSupabase } from "@/lib/db/supabase.browser";

const SECTIONS: { id: FeedSection; title: string; showLikes: boolean }[] = [
  { id: "featured", title: "archive.featured", showLikes: false },
  { id: "top", title: "archive.topRated", showLikes: true },
  { id: "latest", title: "archive.latest", showLikes: false },
];

export function HomeScreen() {
  return (
    <Stack spacing={6}>
      {SECTIONS.map((section) => (
        <FeedBlock
          key={section.id}
          section={section.id}
          title={section.title}
          showLikes={section.showLikes}
        />
      ))}
    </Stack>
  );
}

function FeedBlock(props: {
  section: FeedSection;
  title: string;
  showLikes: boolean;
}) {
  const { section, title, showLikes } = props;
  const { enqueueSnackbar } = useSnackbar();
  const feed = useQuery({
    queryKey: ["feed", section],
    queryFn: async () => {
      if (section === "featured" && featuredIds.length === 0) {
        return [];
      }
      const supabase = getBrowserSupabase();
      if (!supabase) {
        throw new Error("The archive could not be read.");
      }
      return readFeed(supabase, section);
    },
  });

  useEffect(() => {
    if (feed.error instanceof Error) {
      enqueueSnackbar(feed.error.message, { variant: "error" });
    }
  }, [enqueueSnackbar, feed.error]);

  return (
    <Stack spacing={1}>
      <Typography variant="h4">
        <FormattedMessage id={title} />
      </Typography>
      {feed.isPending ? (
        <Typography>
          <FormattedMessage id="archive.loading" />
        </Typography>
      ) : null}
      {feed.isError ? (
        <Typography color="text.secondary">
          <FormattedMessage id="archive.unavailable" />
        </Typography>
      ) : null}
      {feed.data && feed.data.length === 0 ? (
        <Typography color="text.secondary">
          <FormattedMessage
            id={
              section === "featured" ? "archive.featuredEmpty" : "archive.empty"
            }
          />
        </Typography>
      ) : null}
      {feed.data && feed.data.length > 0 ? (
        <CatalogList rows={feed.data} showKind showLikes={showLikes} />
      ) : null}
    </Stack>
  );
}
