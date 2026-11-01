"use client";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useSnackbar } from "notistack";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

// USDT addresses. The code holds the plain address: a wallet picks the network.
const EVM = "0xd242027a71677385e653de94aec92f93884805be";
const WALLETS = [
  { label: "Tron", address: "TXUDr9gtwjHYeEjvcnUC7hMA3CEKA8EuwN" },
  { label: "Ethereum", address: EVM },
  { label: "BNB Chain", address: EVM },
  { label: "Polygon", address: EVM },
  { label: "Arbitrum", address: EVM },
  { label: "Solana", address: "BxEc1tGJWabwQKZFmPBFHTkx9Mmbo9CDJFAHBUmrqvf2" },
  { label: "TON", address: "UQDLjI2O5QJ-H54a7w2NATUhMsTlI7ikt9fZQDw7UfkyzTU8" },
];

// The foot of the home page.
export function DonationBlock() {
  const { enqueueSnackbar } = useSnackbar();
  const { formatMessage } = useIntl();
  const [tab, setTab] = useState(0);
  const wallet = WALLETS[tab];
  const copy = () => {
    void navigator.clipboard.writeText(wallet.address).then(() => {
      enqueueSnackbar(formatMessage({ id: "archive.donationCopied" }));
    });
  };
  return (
    <Card variant="outlined">
      <Tabs
        onChange={(_event, next: number) => setTab(next)}
        scrollButtons="auto"
        value={tab}
        variant="scrollable"
      >
        {WALLETS.map((row) => (
          <Tab
            key={row.label}
            label={row.label}
            sx={{ textTransform: "none" }}
          />
        ))}
      </Tabs>
      <CardContent>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          sx={{ alignItems: { xs: "center", sm: "flex-start" } }}
        >
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: 1,
              flexShrink: 0,
              p: 1.5,
              lineHeight: 0,
            }}
          >
            <QRCodeSVG value={wallet.address} size={148} />
          </Box>
          <Stack spacing={1} sx={{ minWidth: 0, width: "100%" }}>
            <Typography variant="h5">
              <FormattedMessage id="archive.donationTitle" />
            </Typography>
            <Typography color="text.secondary">
              <FormattedMessage id="archive.donationText" />
            </Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Typography
                sx={{
                  fontFamily: "monospace",
                  minWidth: 0,
                  overflowWrap: "anywhere",
                }}
              >
                {wallet.address}
              </Typography>
              <Tooltip title={formatMessage({ id: "archive.donationCopy" })}>
                <IconButton
                  aria-label={formatMessage({ id: "archive.donationCopy" })}
                  onClick={copy}
                  size="small"
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage id="archive.donationNetwork" />
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
