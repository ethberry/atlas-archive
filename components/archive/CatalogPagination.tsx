"use client";

import Pagination from "@mui/material/Pagination";
import { useRouter } from "next/navigation";

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
  const { pathname, query, total } = props;
  const router = useRouter();

  function open(page: number) {
    router.push(`${pathname}${toSearchParams(query, page)}`, { scroll: false });
  }

  // First, previous, the first three pages, the current one, the last
  // three, next, last. A list of one page shows none.
  const count = pageCount(total ?? 0);
  if (count <= 1) {
    return null;
  }
  return (
    <Pagination
      page={Math.min(query.page, count)}
      count={count}
      boundaryCount={3}
      siblingCount={0}
      showFirstButton
      showLastButton
      onChange={(_event, page) => open(page)}
    />
  );
}
