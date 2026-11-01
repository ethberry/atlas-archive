"use client";

import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import { useIntl } from "react-intl";

// The verified mark: a green check on an item checked in the game. It is set
// in the database, not on the site.
export function VerifiedMark() {
  const intl = useIntl();
  const label = intl.formatMessage({ id: "archive.verified" });
  return (
    <Tooltip title={label}>
      <Box
        component="span"
        aria-label={label}
        sx={{ display: "inline-flex", p: 1, color: "success.main" }}
      >
        <CheckCircleOutlinedIcon />
      </Box>
    </Tooltip>
  );
}
