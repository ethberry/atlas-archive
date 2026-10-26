"use client";

import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import type { ReactNode } from "react";

export function LegalDocument(props: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <Stack component="article" spacing={2.5} sx={{ maxWidth: 760, pb: 2 }}>
      <Typography variant="h4" component="h1">
        {props.title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Last updated: {props.updated}
      </Typography>
      {props.children}
      <Typography variant="body2" color="text.secondary">
        <Link component={NextLink} href="/privacy">
          Privacy policy
        </Link>
        {" · "}
        <Link component={NextLink} href="/terms">
          Terms of service
        </Link>
      </Typography>
    </Stack>
  );
}

export function LegalSection(props: { title: string; children: ReactNode }) {
  return (
    <Stack spacing={1}>
      <Typography variant="h6" component="h2">
        {props.title}
      </Typography>
      {props.children}
    </Stack>
  );
}

export function LegalText(props: { children: ReactNode }) {
  return <Typography variant="body1">{props.children}</Typography>;
}
