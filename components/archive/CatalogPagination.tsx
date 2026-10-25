"use client";

import Button from "@mui/material/Button";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { useRouter } from "next/navigation";
import { FormattedMessage } from "react-intl";

import {
  pageCount,
  toSearchParams,
  type CatalogQuery,
} from "@/lib/archive/query";

export function CatalogPagination(props: {
  pathname: string;
  query: CatalogQuery;
  total: number | null;
  hasNext: boolean;
}) {
  const { pathname, query, total, hasNext } = props;
  const router = useRouter();

  function open(page: number) {
    router.push(`${pathname}${toSearchParams(query, page)}`);
  }

  if (total === null) {
    if (query.page === 1 && !hasNext) {
      return null;
    }
    return (
      <Stack direction="row" spacing={1}>
        <Button disabled={query.page <= 1} onClick={() => open(query.page - 1)}>
          <FormattedMessage id="archive.previous" />
        </Button>
        <Button disabled={!hasNext} onClick={() => open(query.page + 1)}>
          <FormattedMessage id="archive.next" />
        </Button>
      </Stack>
    );
  }

  const count = pageCount(total);
  if (count <= 1) {
    return null;
  }
  return (
    <Pagination
      page={Math.min(query.page, count)}
      count={count}
      onChange={(_event, page) => open(page)}
    />
  );
}
