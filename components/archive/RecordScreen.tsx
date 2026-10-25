"use client";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { useSnackbar } from "notistack";

import { AssetCard } from "@/components/archive/AssetCard";
import { CatalogScreen } from "@/components/archive/CatalogScreen";
import { childKinds, type Kind } from "@/lib/archive/kinds";
import type { CatalogQuery } from "@/lib/archive/query";
import { readRecord } from "@/lib/archive/read";
import { getBrowserSupabase } from "@/lib/db/supabase.browser";

export function RecordScreen(props: {
  kind: Kind;
  id: string;
  pathname: string;
  query: CatalogQuery;
}) {
  const { kind, id, pathname, query } = props;
  const { enqueueSnackbar } = useSnackbar();
  const record = useQuery({
    queryKey: ["record", kind, id],
    queryFn: async () => {
      const supabase = getBrowserSupabase();
      if (!supabase) {
        throw new Error("The archive could not be read.");
      }
      return readRecord(supabase, kind, id);
    },
  });

  useEffect(() => {
    if (record.error instanceof Error) {
      enqueueSnackbar(record.error.message, { variant: "error" });
    }
  }, [enqueueSnackbar, record.error]);

  if (record.isSuccess && record.data === null) {
    notFound();
  }

  const children = childKinds(kind);

  return (
    <Stack spacing={4}>
      {record.isPending ? (
        <Typography>
          <FormattedMessage id="archive.loading" />
        </Typography>
      ) : null}
      {record.isError ? (
        <Typography color="text.secondary">
          <FormattedMessage id="archive.unavailable" />
        </Typography>
      ) : null}
      {record.data ? <AssetCard asset={record.data} /> : null}
      {record.data && children.length > 0 ? (
        <CatalogScreen
          pathname={pathname}
          query={{ ...query, kinds: children, parentId: id }}
        />
      ) : null}
    </Stack>
  );
}
