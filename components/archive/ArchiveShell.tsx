"use client";

import Container from "@mui/material/Container";
import type { PropsWithChildren } from "react";

import { ArchiveBar } from "@/components/archive/ArchiveBar";

export function ArchiveShell({ children }: PropsWithChildren) {
  return (
    <>
      <ArchiveBar />
      <Container sx={{ py: 4 }}>{children}</Container>
    </>
  );
}
