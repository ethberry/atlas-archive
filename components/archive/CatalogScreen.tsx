"use client";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { useSnackbar } from "notistack";

import { CatalogFilters } from "@/components/archive/CatalogFilters";
import { CatalogList } from "@/components/archive/CatalogList";
import { CatalogPagination } from "@/components/archive/CatalogPagination";
import { catalogKey, type CatalogQuery } from "@/lib/archive/query";
import { readCatalog } from "@/lib/archive/read";
import { getBrowserSupabase } from "@/lib/db/supabase.browser";

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

  return (
    <Stack spacing={3}>
      {heading && query.kinds.length === 1 ? (
        <Typography variant="h4">
          <FormattedMessage id={`kind.${query.kinds[0]}`} />
        </Typography>
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
