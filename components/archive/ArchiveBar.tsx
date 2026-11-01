"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LanguageIcon from "@mui/icons-material/Language";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { FormattedMessage, useIntl } from "react-intl";

import { useAuth } from "@/components/providers/AuthProvider";
import { PAGE_KINDS } from "@/lib/archive/kinds";

export function ArchiveBar() {
  const { signOut, user } = useAuth();
  const intl = useIntl();
  const router = useRouter();
  const [menu, setMenu] = useState<HTMLElement | null>(null);
  const [accountMenu, setAccountMenu] = useState<HTMLElement | null>(null);

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: "divider" }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{ color: "inherit", textDecoration: "none", flexGrow: 1 }}
        >
          <FormattedMessage id="archive.title" />
        </Typography>
        <Button component={Link} href="/about" color="inherit">
          <FormattedMessage id="archive.about" />
        </Button>
        <Button
          startIcon={<LanguageIcon />}
          color="inherit"
          onClick={(event) => setMenu(event.currentTarget)}
          id="browse-button"
          aria-haspopup="true"
          aria-controls={menu ? "browse-menu" : undefined}
          aria-expanded={menu ? "true" : undefined}
          sx={{
            "& .MuiButton-startIcon": { display: { xs: "none", sm: "flex" } },
          }}
        >
          <FormattedMessage id="archive.browse" />
        </Button>
        <Menu
          id="browse-menu"
          anchorEl={menu}
          open={Boolean(menu)}
          onClose={() => setMenu(null)}
          slotProps={{ list: { "aria-labelledby": "browse-button" } }}
        >
          {PAGE_KINDS.map((kind) => (
            <MenuItem
              key={kind}
              onClick={() => {
                setMenu(null);
                router.push(`/${kind}`);
              }}
            >
              <FormattedMessage id={`kinds.${kind}`} />
            </MenuItem>
          ))}
        </Menu>
        {user ? (
          <>
            <IconButton
              id="account-button"
              aria-label={intl.formatMessage({ id: "archive.account" })}
              aria-haspopup="true"
              aria-controls={accountMenu ? "account-menu" : undefined}
              aria-expanded={accountMenu ? "true" : undefined}
              onClick={(event) => setAccountMenu(event.currentTarget)}
              sx={{ p: 0.5 }}
            >
              {/* Google's picture; the first letter of the name without one. */}
              <Avatar
                src={user.user_metadata.avatar_url as string | undefined}
                alt={user.user_metadata.full_name as string | undefined}
                slotProps={{ img: { referrerPolicy: "no-referrer" } }}
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
            <Menu
              id="account-menu"
              anchorEl={accountMenu}
              open={Boolean(accountMenu)}
              onClose={() => setAccountMenu(null)}
              slotProps={{ list: { "aria-labelledby": "account-button" } }}
            >
              <MenuItem
                onClick={() => {
                  setAccountMenu(null);
                  router.push("/likes");
                }}
              >
                <FormattedMessage id="archive.yourLikes" />
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setAccountMenu(null);
                  void signOut();
                }}
              >
                <FormattedMessage id="archive.signOut" />
              </MenuItem>
            </Menu>
          </>
        ) : null}
      </Toolbar>
    </AppBar>
  );
}
