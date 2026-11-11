"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import type { PropsWithChildren, ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import { ArchiveBar } from "@/components/archive/ArchiveBar";
import { PAGE_KINDS } from "@/lib/archive/kinds";
import { GUIDE_MENU as statisticsMenu } from "@/lib/archive/features";
import { TOOLS } from "@/lib/archive/tools";
import { groupPath, QUESTS_PATH } from "@/lib/archive/guides";

type Column = { title: ReactNode; links: { href: string; label: ReactNode }[] };

// The sections in plain links, one column each, so a crawler reaches what the
// menus hold.
const COLUMNS: Column[] = [
  {
    title: <FormattedMessage id="archive.title" />,
    links: [
      { href: "/about", label: <FormattedMessage id="archive.about" /> },
      { href: "/privacy", label: <FormattedMessage id="archive.privacy" /> },
      { href: "/terms", label: <FormattedMessage id="archive.terms" /> },
      {
        href: "/release-notes",
        label: <FormattedMessage id="archive.releaseNotes" />,
      },
      {
        href: "/game-bugs",
        label: <FormattedMessage id="archive.gameBugs" />,
      },
    ],
  },
  {
    title: <FormattedMessage id="archive.browse" />,
    links: PAGE_KINDS.map((kind) => ({
      href: `/${kind}`,
      label: <FormattedMessage id={`kinds.${kind}`} />,
    })),
  },
  // One link a group of guides, to the group's own page.
  {
    title: <FormattedMessage id="archive.statistics" />,
    links: statisticsMenu.map((group) => ({
      href: groupPath(group.slug),
      label: group.title,
    })),
  },
  // The Quests section, by its own page, as a group of guides is.
  {
    title: <FormattedMessage id="archive.quests" />,
    links: [
      { href: QUESTS_PATH, label: <FormattedMessage id="archive.quests" /> },
    ],
  },
  {
    title: <FormattedMessage id="archive.tools" />,
    links: TOOLS.map((tool) => ({
      href: tool.href,
      label: <FormattedMessage id={tool.id} />,
    })),
  },
];

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
        sx={{ borderTop: 1, borderColor: "divider", py: 4 }}
      >
        <Container
          component="nav"
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(5, 1fr)",
            },
            columnGap: 3,
            rowGap: 3,
          }}
        >
          {COLUMNS.map((column, index) => (
            <Stack key={index} spacing={0.75}>
              <Typography variant="subtitle2" component="h2">
                {column.title}
              </Typography>
              {column.links.map((link) => (
                <Link
                  key={link.href}
                  component={NextLink}
                  href={link.href}
                  color="text.secondary"
                  variant="body2"
                  underline="hover"
                >
                  {link.label}
                </Link>
              ))}
            </Stack>
          ))}
        </Container>
      </Box>
    </Box>
  );
}
