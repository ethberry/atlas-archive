"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import NextLink from "next/link";
import type { PropsWithChildren } from "react";
import { FormattedMessage } from "react-intl";

import { ArchiveBar } from "@/components/archive/ArchiveBar";

export function ArchiveShell({ children }: PropsWithChildren) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <ArchiveBar />
      <Container component="main" sx={{ py: 4, flexGrow: 1 }}>
        {children}
      </Container>
      <Box
        component="footer"
        sx={{ borderTop: 1, borderColor: "divider", py: 2 }}
      >
        <Container>
          <Stack component="nav" direction="row" spacing={3}>
            <Link
              component={NextLink}
              href="/privacy"
              color="text.secondary"
              variant="body2"
            >
              <FormattedMessage id="archive.privacy" />
            </Link>
            <Link
              component={NextLink}
              href="/terms"
              color="text.secondary"
              variant="body2"
            >
              <FormattedMessage id="archive.terms" />
            </Link>
            <Link
              component={NextLink}
              href="/release-notes"
              color="text.secondary"
              variant="body2"
            >
              <FormattedMessage id="archive.releaseNotes" />
            </Link>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
