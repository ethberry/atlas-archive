"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LanguageIcon from "@mui/icons-material/Language";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { FormattedMessage } from "react-intl";

import { useAuth } from "@/components/providers/AuthProvider";
import { KINDS } from "@/lib/archive/kinds";

export function ArchiveBar() {
  const { setOpen, user } = useAuth();
  const router = useRouter();
  const [menu, setMenu] = useState<HTMLElement | null>(null);

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
        <Button
          startIcon={<LanguageIcon />}
          color="inherit"
          onClick={(event) => setMenu(event.currentTarget)}
          id="browse-button"
          aria-haspopup="true"
          aria-controls={menu ? "browse-menu" : undefined}
          aria-expanded={menu ? "true" : undefined}
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
          {KINDS.map((kind) => (
            <MenuItem
              key={kind}
              onClick={() => {
                setMenu(null);
                router.push(`/${kind}`);
              }}
            >
              <FormattedMessage id={`kind.${kind}`} />
            </MenuItem>
          ))}
        </Menu>
        <Button color="inherit" onClick={() => setOpen(true)}>
          <FormattedMessage id={user ? "archive.account" : "archive.signIn"} />
        </Button>
      </Toolbar>
    </AppBar>
  );
}
