"use client";

import Breadcrumbs from "@mui/material/Breadcrumbs";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import type { PageStep } from "@/lib/archive/trail";

// The way back up on a page that is no record.
export function PageTrail(props: { steps: PageStep[] }) {
  const { steps } = props;
  return (
    <Breadcrumbs sx={{ mb: 2 }}>
      {steps.map((step) =>
        step.href ? (
          <MuiLink
            key={step.name}
            component={Link}
            href={step.href}
            color="inherit"
            underline="hover"
          >
            {step.name}
          </MuiLink>
        ) : (
          <Typography key={step.name} color="text.primary">
            {step.name}
          </Typography>
        ),
      )}
    </Breadcrumbs>
  );
}
