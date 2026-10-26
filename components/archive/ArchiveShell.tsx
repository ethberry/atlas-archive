"use client";

import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import NextLink from "next/link";
import type { PropsWithChildren } from "react";

import { ArchiveBar } from "@/components/archive/ArchiveBar";

export function ArchiveShell({ children }: PropsWithChildren) {
  return (
    <>
      <ArchiveBar />
      <Container sx={{ py: 4 }}>
        {children}
        <Stack component="nav" direction="row" spacing={2} sx={{ pt: 6 }}>
          <Link
            component={NextLink}
            href="/privacy"
            color="text.secondary"
            variant="body2"
          >
            Privacy policy
          </Link>
          <Link
            component={NextLink}
            href="/terms"
            color="text.secondary"
            variant="body2"
          >
            Terms of service
          </Link>
        </Stack>
      </Container>
    </>
  );
}
