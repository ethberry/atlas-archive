"use client";

import Link from "next/link";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { FormattedMessage } from "react-intl";

export default function NotFound() {
  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h4" gutterBottom>
        <FormattedMessage id="pages.notFound.title" />
      </Typography>
      <Button component={Link} href="/" variant="contained">
        <FormattedMessage id="pages.notFound.home" />
      </Button>
    </Container>
  );
}
