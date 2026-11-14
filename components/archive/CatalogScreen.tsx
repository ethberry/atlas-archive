"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { useSnackbar } from "notistack";

import { CatalogFilters } from "@/components/archive/CatalogFilters";
import { CatalogList } from "@/components/archive/CatalogList";
import { CatalogPagination } from "@/components/archive/CatalogPagination";
import { SHIP_GUIDES, GUIDES } from "@/components/archive/RecordNote";
import { catalogKey, isFiltered, type CatalogQuery } from "@/lib/archive/query";
import { readCatalog } from "@/lib/archive/read";
import { getBrowserSupabase } from "@/lib/db/supabase.browser";

// The note shown instead of an empty list.
export function NothingFound() {
  return (
    <Card variant="outlined" sx={{ mb: 4 }}>
      {/* CardContent pads its last child more at the bottom; even it out. */}
      <CardContent sx={{ "&:last-child": { pb: 2 } }}>
        <Typography color="text.secondary">
          <FormattedMessage id="archive.nothingFound" />
        </Typography>
      </CardContent>
    </Card>
  );
}

export function CatalogScreen(props: {
  pathname: string;
  query: CatalogQuery;
  heading?: boolean;
}) {
  const { pathname, query, heading = false } = props;
  const { enqueueSnackbar } = useSnackbar();
  const list = useQuery({
    queryKey: catalogKey(query),
    queryFn: async () => {
      const supabase = getBrowserSupabase();
      if (!supabase) {
        throw new Error("The archive could not be read.");
      }
      return readCatalog(supabase, query);
    },
  });

  useEffect(() => {
    if (list.error instanceof Error) {
      enqueueSnackbar(list.error.message, { variant: "error" });
    }
  }, [enqueueSnackbar, list.error]);

  // Nothing at all here: no form to search with, only a note.
  if (list.data && list.data.total === 0 && !isFiltered(query)) {
    return <NothingFound />;
  }

  return (
    <Stack spacing={3}>
      {heading && query.kinds.length === 1 ? (
        <Stack spacing={1}>
          <Typography variant="h4" component="h1">
            <FormattedMessage id={`kinds.${query.kinds[0]}`} />
          </Typography>
          <Typography color="text.secondary">
            <FormattedMessage
              id={`kindLead.${query.kinds[0]}`}
              values={query.kinds[0] === "ship" ? SHIP_GUIDES : GUIDES}
            />
          </Typography>
        </Stack>
      ) : null}
      <CatalogFilters pathname={pathname} query={query} />
      {list.isPending ? (
        <Typography>
          <FormattedMessage id="archive.loading" />
        </Typography>
      ) : null}
      {list.isError ? (
        <Typography color="text.secondary">
          <FormattedMessage id="archive.unavailable" />
        </Typography>
      ) : null}
      {list.data ? (
        <>
          <CatalogList rows={list.data.rows} />
          <CatalogPagination
            pathname={pathname}
            query={query}
            total={list.data.total}
            hasNext={list.data.hasNext}
          />
        </>
      ) : null}
    </Stack>
  );
}
