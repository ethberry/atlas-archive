import type { ReactNode } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { FormattedMessage } from "react-intl";

import { guidePath } from "@/lib/archive/guides";

// The width of one portal glyph of the glyph font, in ems.
const GLYPH_WIDTH = 1.04;

// One row of portal glyphs across the width it is given, whatever that is, and
// a note under it: by default, why the system holds no class S wreck.
export function Answer(props: { code: string; note?: ReactNode }) {
  const { code, note } = props;
  return (
    // Wider than the article column: the row runs almost across the page.
    <Box
      sx={{
        containerType: "inline-size",
        width: "min(calc(100vw - 48px), 1152px)",
        position: "relative",
        left: "50%",
        transform: "translateX(-50%)",
      }}
    >
      <Box
        aria-label={code}
        sx={{
          fontFamily: "var(--font-glyphs)",
          fontSize: `calc(100cqw / ${code.length * GLYPH_WIDTH})`,
          lineHeight: 1.1,
          whiteSpace: "nowrap",
          textAlign: "center",
        }}
      >
        {code}
      </Box>
      <Typography variant="body2" sx={{ textAlign: "center", mt: 1 }}>
        {note ?? (
          <FormattedMessage
            id="archive.finderNoS"
            values={{
              a: (chunks) => (
                <MuiLink component={Link} href={guidePath("economy")}>
                  {chunks}
                </MuiLink>
              ),
            }}
          />
        )}
      </Typography>
    </Box>
  );
}
