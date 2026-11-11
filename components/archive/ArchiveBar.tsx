"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { FormattedMessage, useIntl } from "react-intl";

import { useAuth } from "@/components/providers/AuthProvider";
import { PAGE_KINDS } from "@/lib/archive/kinds";
import { GUIDE_MENU as statisticsMenu } from "@/lib/archive/features";
import { groupPath, guidePath } from "@/lib/archive/guides";
import { QUESTS_PATH } from "@/lib/archive/guides";
import { TOOLS } from "@/lib/archive/tools";

// The header's links stand in the drawer below this width.
const DESKTOP = {
  display: { xs: "none", md: "inline-flex" },
  whiteSpace: "nowrap",
};

export function ArchiveBar() {
  const { signOut, user } = useAuth();
  const intl = useIntl();
  const router = useRouter();
  const [menu, setMenu] = useState<HTMLElement | null>(null);
  const [statsMenu, setStatsMenu] = useState<HTMLElement | null>(null);
  const [toolsMenu, setToolsMenu] = useState<HTMLElement | null>(null);
  const [accountMenu, setAccountMenu] = useState<HTMLElement | null>(null);
  const [drawer, setDrawer] = useState(false);
  const theme = useTheme();
  // The drawer closes when the window grows past it.
  useEffect(() => {
    const wide = window.matchMedia(
      theme.breakpoints.up("md").replace("@media ", ""),
    );
    const close = () => {
      if (wide.matches) {
        setDrawer(false);
      }
    };
    wide.addEventListener("change", close);
    return () => wide.removeEventListener("change", close);
  }, [theme]);
  // One open section at a time keeps the drawer short.
  type Section = "browse" | "statistics" | "tools";
  const [section, setSection] = useState<Section | null>(null);
  const toggleSection = (next: Section) =>
    setSection((open) => (open === next ? null : next));
  // Inside the guides, one open group at a time too: the group's name opens
  // its own page, the arrow beside it its guides.
  const [guideGroup, setGuideGroup] = useState<string | null>(null);
  const toggleGroup = (next: string) =>
    setGuideGroup((open) => (open === next ? null : next));
  const drawerLink = (href: string, id: string, nested = false) => (
    <ListItemButton
      key={href}
      component={Link}
      href={href}
      onClick={() => setDrawer(false)}
      sx={nested ? { pl: 4 } : undefined}
    >
      <ListItemText primary={<FormattedMessage id={id} />} />
    </ListItemButton>
  );

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
        <IconButton
          color="inherit"
          aria-label={intl.formatMessage({ id: "archive.navigation" })}
          data-tour="menu"
          onClick={() => setDrawer(true)}
          sx={{ display: { md: "none" } }}
        >
          <MenuIcon />
        </IconButton>
        <Drawer anchor="right" open={drawer} onClose={() => setDrawer(false)}>
          <Box component="nav" sx={{ width: 260 }}>
            <List>
              {drawerLink("/about", "archive.about")}
              <ListItemButton onClick={() => toggleSection("browse")}>
                <ListItemText
                  primary={<FormattedMessage id="archive.browse" />}
                />
                {section === "browse" ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={section === "browse"} unmountOnExit>
                {PAGE_KINDS.map((kind) =>
                  drawerLink(`/${kind}`, `kinds.${kind}`, true),
                )}
              </Collapse>
              {/* The name opens the guides page, the arrow its groups, as a
                  group's name opens its page and the arrow its guides. */}
              <ListItem
                disablePadding
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label={intl.formatMessage({
                      id: "archive.guidesMenu",
                    })}
                    aria-expanded={section === "statistics"}
                    onClick={() => toggleSection("statistics")}
                  >
                    {section === "statistics" ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                }
              >
                <ListItemButton
                  component={Link}
                  href="/guides"
                  onClick={() => setDrawer(false)}
                >
                  <ListItemText
                    primary={<FormattedMessage id="archive.statistics" />}
                  />
                </ListItemButton>
              </ListItem>
              <Collapse in={section === "statistics"} unmountOnExit>
                {statisticsMenu.flatMap((group) => [
                  <ListItem
                    key={group.slug}
                    disablePadding
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label={group.title}
                        aria-expanded={guideGroup === group.slug}
                        onClick={() => toggleGroup(group.slug)}
                      >
                        {guideGroup === group.slug ? (
                          <ExpandLess />
                        ) : (
                          <ExpandMore />
                        )}
                      </IconButton>
                    }
                  >
                    <ListItemButton
                      component={Link}
                      href={groupPath(group.slug)}
                      onClick={() => setDrawer(false)}
                      sx={{ pl: 4 }}
                    >
                      <ListItemText primary={group.title} />
                    </ListItemButton>
                  </ListItem>,
                  <Collapse
                    key={`${group.slug}-pages`}
                    in={guideGroup === group.slug}
                    unmountOnExit
                  >
                    {group.pages.map((page) => (
                      <ListItemButton
                        key={page.slug}
                        component={Link}
                        href={guidePath(page.slug)}
                        onClick={() => setDrawer(false)}
                        sx={{ pl: 6 }}
                      >
                        <ListItemText primary={page.title} />
                      </ListItemButton>
                    ))}
                  </Collapse>,
                ])}
              </Collapse>
              {drawerLink(QUESTS_PATH, "archive.quests")}
              <ListItemButton onClick={() => toggleSection("tools")}>
                <ListItemText
                  primary={<FormattedMessage id="archive.tools" />}
                />
                {section === "tools" ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={section === "tools"} unmountOnExit>
                {TOOLS.map((tool) => drawerLink(tool.href, tool.id, true))}
              </Collapse>
            </List>
          </Box>
        </Drawer>
        <Button component={Link} href="/about" color="inherit" sx={DESKTOP}>
          <FormattedMessage id="archive.about" />
        </Button>
        <Button
          color="inherit"
          onClick={(event) => setMenu(event.currentTarget)}
          id="browse-button"
          data-tour="browse"
          aria-haspopup="true"
          aria-controls={menu ? "browse-menu" : undefined}
          aria-expanded={menu ? "true" : undefined}
          sx={DESKTOP}
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
              component={Link}
              href={`/${kind}`}
              onClick={() => setMenu(null)}
            >
              <FormattedMessage id={`kinds.${kind}`} />
            </MenuItem>
          ))}
        </Menu>
        {/* The word is a link to the guides page, the arrow beside it opens
            the menu of the groups. */}
        <Box data-tour="statistics" sx={{ ...DESKTOP, alignItems: "center" }}>
          <Button
            component={Link}
            href="/guides"
            color="inherit"
            sx={{ minWidth: 0, pr: 0.5 }}
          >
            <FormattedMessage id="archive.statistics" />
          </Button>
          <IconButton
            color="inherit"
            size="small"
            onClick={(event) => setStatsMenu(event.currentTarget.parentElement)}
            id="statistics-button"
            aria-label={intl.formatMessage({ id: "archive.guidesMenu" })}
            aria-haspopup="true"
            aria-controls={statsMenu ? "statistics-menu" : undefined}
            aria-expanded={statsMenu ? "true" : undefined}
          >
            {statsMenu ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
        <Menu
          id="statistics-menu"
          anchorEl={statsMenu}
          open={Boolean(statsMenu)}
          onClose={() => setStatsMenu(null)}
          slotProps={{ list: { "aria-labelledby": "statistics-button" } }}
        >
          {statisticsMenu.flatMap((group) => [
            <MenuItem
              key={group.slug}
              component={Link}
              href={groupPath(group.slug)}
              onClick={() => setStatsMenu(null)}
              sx={{ fontWeight: 700 }}
            >
              {group.title}
            </MenuItem>,
            ...group.pages.map((page) => (
              <MenuItem
                key={page.slug}
                component={Link}
                href={guidePath(page.slug)}
                onClick={() => setStatsMenu(null)}
                sx={{ pl: 4 }}
              >
                {page.title}
              </MenuItem>
            )),
          ])}
        </Menu>
        <Button
          component={Link}
          href={QUESTS_PATH}
          color="inherit"
          sx={DESKTOP}
        >
          <FormattedMessage id="archive.quests" />
        </Button>
        <Button
          color="inherit"
          onClick={(event) => setToolsMenu(event.currentTarget)}
          id="tools-button"
          data-tour="tools"
          aria-haspopup="true"
          aria-controls={toolsMenu ? "tools-menu" : undefined}
          aria-expanded={toolsMenu ? "true" : undefined}
          sx={DESKTOP}
        >
          <FormattedMessage id="archive.tools" />
        </Button>
        <Menu
          id="tools-menu"
          anchorEl={toolsMenu}
          open={Boolean(toolsMenu)}
          onClose={() => setToolsMenu(null)}
          slotProps={{ list: { "aria-labelledby": "tools-button" } }}
        >
          {TOOLS.map((tool) => (
            <MenuItem
              key={tool.href}
              component={Link}
              href={tool.href}
              onClick={() => setToolsMenu(null)}
            >
              <FormattedMessage id={tool.id} />
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
