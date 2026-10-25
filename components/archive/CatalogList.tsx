"use client";

import Link from "next/link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { FormattedMessage } from "react-intl";

import type { CatalogRow } from "@/lib/archive/read";

export function CatalogList(props: {
  rows: CatalogRow[];
  showKind?: boolean;
  showLikes?: boolean;
}) {
  const { rows, showKind = false, showLikes = false } = props;
  if (rows.length === 0) {
    return (
      <Typography color="text.secondary">
        <FormattedMessage id="archive.empty" />
      </Typography>
    );
  }
  return (
    <List>
      {rows.map((row) => (
        <ListItem key={row.id} disablePadding>
          <ListItemButton component={Link} href={`/${row.kind}/${row.id}`}>
            <ListItemText
              primary={row.name}
              secondary={
                showKind || showLikes ? (
                  <>
                    {showKind ? (
                      <FormattedMessage id={`kind.${row.kind}`} />
                    ) : null}
                    {showKind && showLikes ? " · " : null}
                    {showLikes ? row.likeCount : null}
                  </>
                ) : null
              }
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}
