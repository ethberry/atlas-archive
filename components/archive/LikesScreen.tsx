"use client";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { FormattedMessage } from "react-intl";

import { NothingFound } from "@/components/archive/CatalogScreen";
import { ItemTabs } from "@/components/archive/ItemTabs";
import { useAuth } from "@/components/providers/AuthProvider";
import type { CatalogQuery } from "@/lib/archive/query";

// The items the signed-in player liked, in the same tabs as a planet.
export function LikesScreen(props: { query: CatalogQuery }) {
  const { query } = props;
  const { user } = useAuth();
  return (
    <Stack spacing={3}>
      <Typography variant="h4">
        <FormattedMessage id="archive.yourLikes" />
      </Typography>
      {user ? (
        <ItemTabs
          anchor={{ likedBy: user.id }}
          pathname="/likes"
          query={query}
        />
      ) : (
        <NothingFound />
      )}
    </Stack>
  );
}
