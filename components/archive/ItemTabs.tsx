"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FormattedMessage } from "react-intl";

import {
  CatalogScreen,
  NothingFound,
} from "@/components/archive/CatalogScreen";
import type { Kind } from "@/lib/archive/kinds";
import {
  parseCatalogQuery,
  toSearchParams,
  type CatalogQuery,
} from "@/lib/archive/query";
import { countItems, type ItemAnchor } from "@/lib/archive/read";
import { getBrowserSupabase } from "@/lib/db/supabase.browser";

// Items in one tab per kind, the most common first: the generator stores many
// more pillar tools than adoptable creatures, and S wrecks with touching cells
// are rarer still. The anchor says whose items: a planet's or a player's likes.
// Only the open tab is loaded; a tab the visitor leaves is unmounted.
const TABS: Kind[] = ["tool", "creature", "ship"];

export function ItemTabs(props: {
  anchor: ItemAnchor;
  pathname: string;
  query: CatalogQuery;
}) {
  const { anchor, pathname, query } = props;
  const router = useRouter();
  // One small count per tab; the items themselves load only for the open tab.
  const counts = useQuery({
    queryKey: ["item-tabs", anchor],
    queryFn: async () => {
      const supabase = getBrowserSupabase();
      if (!supabase) {
        throw new Error("The archive could not be read.");
      }
      const found = await Promise.all(
        TABS.map((tab) => countItems(supabase, anchor, tab)),
      );
      return new Map(TABS.map((tab, index) => [tab, found[index]]));
    },
  });
  if (!counts.data) {
    return null;
  }
  // A kind with nothing here gets no tab; nothing at all gets the note.
  const tabs = TABS.filter((tab) => (counts.data.get(tab) ?? 0) > 0);
  if (tabs.length === 0) {
    return <NothingFound />;
  }
  // The tab lives in the address, so a shared link opens the same list.
  const kind = tabs.find((tab) => tab === query.tab) ?? tabs[0];
  return (
    <Card variant="outlined">
      <Tabs
        value={kind}
        onChange={(_event, next: Kind) => {
          // The filters of one kind mean nothing to another.
          const fresh = { ...parseCatalogQuery([next], {}), tab: next };
          router.replace(`${pathname}${toSearchParams(fresh, 1)}`, {
            scroll: false,
          });
        }}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab}
            value={tab}
            label={
              <Stack
                direction="row"
                useFlexGap
                spacing={1}
                sx={{ alignItems: "center" }}
              >
                <FormattedMessage id={`kinds.${tab}`} />
                <Chip
                  size="small"
                  label={counts.data.get(tab) ?? 0}
                  sx={{ borderRadius: 1 }}
                />
              </Stack>
            }
          />
        ))}
      </Tabs>
      <CardContent>
        <CatalogScreen
          key={kind}
          pathname={pathname}
          query={{
            ...query,
            kinds: [kind],
            tab: kind,
            parentId: null,
            ...anchor,
          }}
        />
      </CardContent>
    </Card>
  );
}
