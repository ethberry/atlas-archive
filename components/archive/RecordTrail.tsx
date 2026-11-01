"use client";

import Breadcrumbs from "@mui/material/Breadcrumbs";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { FormattedMessage } from "react-intl";

import type { AssetCard } from "@/lib/archive/read";

// The way back up: home, then every record above this one.
export function RecordTrail(props: { asset: AssetCard }) {
  const { asset } = props;
  return (
    <Breadcrumbs>
      <MuiLink component={Link} href="/" color="inherit" underline="hover">
        <FormattedMessage id="archive.home" />
      </MuiLink>
      {asset.trail.map((step) => (
        <MuiLink
          key={step.id}
          component={Link}
          href={`/${step.kind}/${step.id}`}
          color="inherit"
          underline="hover"
        >
          {step.name}
        </MuiLink>
      ))}
      <Typography color="text.primary">{asset.name}</Typography>
    </Breadcrumbs>
  );
}
