"use client";

import { useEffect, useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useSnackbar } from "notistack";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

import { ColourTiles } from "@/components/archive/builder/ColourTiles";
import { PartTiles } from "@/components/archive/builder/PartTiles";
import { Ship } from "@/components/archive/builder/Ship";
import { SignIn } from "@/components/archive/builder/SignIn";
import { INK, SURFACE } from "@/components/archive/builder/style";
import { useAuth } from "@/components/providers/AuthProvider";
import { NO_PAINT, type Paint } from "@/lib/archive/builder/paint";
import { chipNames, optionOf } from "@/lib/archive/builder/parts";
import type { ShipModule } from "@/lib/archive/builder/ship";
import {
  choiceOf,
  pick,
  treeCore,
  type Assignment,
  type Parts,
} from "@/lib/archive/builder/tree";
import { getBrowserSupabase } from "@/lib/db/supabase.browser";

// Postgres's code for a unique violation: the same player asking the same form
// again, which counts once (`search_requests_one_form`).
const UNIQUE_VIOLATION = "23505";

// A ship builder. Its state is the game's own: one part per list of the ship's
// tree, as a seed fills them (lib/archive/builder/tree.ts); the chips, the open
// group's tiles, and the picture are all read off the walk of that state. Its
// button asks for a search the site does not do yet (the owner, 2026-11-06): it
// asks to sign in first, then stores the walk's options with the player in
// `search_requests` and says the search is not built yet, to learn how many
// different people want it.
export function Builder(props: { ship: ShipModule }) {
  const { ship } = props;
  const { paint: colours } = ship;
  const [parts, setParts] = useState<Parts | null>(null);
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [picks, setPicks] = useState<Assignment | null>(null);
  const [paint, setPaint] = useState<Paint>(NO_PAINT);
  const [active, setActive] = useState(ship.groups[0].id);
  const [asked, setAsked] = useState(false);
  const [signIn, setSignIn] = useState(false);

  const core = useMemo(
    () => (parts ? treeCore(parts, ship.groups) : null),
    [parts, ship.groups],
  );
  // The walk's state: the picks made here, from the start the core gives.
  const assignment =
    picks && core && picks.length === core.lists.length
      ? picks
      : (core?.start ?? null);
  const choice = useMemo(
    () => (core && assignment ? choiceOf(core, assignment) : {}),
    [core, assignment],
  );
  const fits = useMemo(
    () => ship.groups.filter((row) => choice[row.id] !== undefined),
    [ship.groups, choice],
  );
  const names = useMemo(() => chipNames(ship.groups, fits), [ship, fits]);
  const painted = useMemo(
    () => colours?.paintedOf(paint) ?? null,
    [colours, paint],
  );
  const picked = ship.groups.find((row) => row.id === active) ?? ship.groups[0];
  // A group the walk no longer reaches hands over to the one of its title that it
  // does.
  const group = fits.includes(picked)
    ? picked
    : (fits.find((row) => row.title === picked.title) ?? fits[0]);

  useEffect(() => {
    void fetch(`${ship.folder}/parts.json`)
      .then((response) => response.json())
      .then((value: Parts) => setParts(value));
  }, [ship.folder]);

  return (
    <Card variant="outlined" sx={{ p: 2, bgcolor: SURFACE, color: INK }}>
      <Stack
        component="form"
        noValidate
        spacing={2}
        onSubmit={(event: React.FormEvent) => {
          event.preventDefault();
          void (async () => {
            const supabase = getBrowserSupabase();
            if (!user) {
              setSignIn(true);
              return;
            }
            const result = await supabase?.from("search_requests").insert({
              user_id: user.id,
              kind: ship.kind,
              choice,
              paint,
            });
            if (
              !result ||
              (result.error && result.error.code !== UNIQUE_VIOLATION)
            ) {
              enqueueSnackbar(<FormattedMessage id="archive.unavailable" />, {
                variant: "error",
              });
              return;
            }
            setAsked(true);
          })();
        }}
      >
        <Box sx={{ minHeight: 200 }}>
          {parts && core && assignment && group ? (
            <Ship
              ship={ship}
              parts={parts}
              core={core}
              assignment={assignment}
              active={group.id}
              painted={painted}
              onSelect={setActive}
            />
          ) : null}
        </Box>
        <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
          {fits.map((row) => (
            <Chip
              key={row.id}
              label={names.get(row.id)}
              clickable
              color={row.id === group?.id ? "primary" : "default"}
              variant={
                optionOf(row, choice[row.id])?.empty ? "outlined" : "filled"
              }
              onClick={() => setActive(row.id)}
            />
          ))}
        </Stack>
        {group ? (
          <PartTiles
            ship={ship}
            parts={parts}
            core={core}
            // The tiles read the ship's start, never the picks: a preview is one
            // fixed picture, not a live one that follows the neighbours (the
            // owner, 2026-11-08).
            assignment={core?.start ?? null}
            group={group}
            value={choice[group.id]}
            title={names.get(group.id) ?? group.title}
            onChange={(option) => {
              if (core && assignment) {
                setPicks(pick(core, assignment, group, option));
              }
            }}
          />
        ) : null}
        {colours ? (
          <ColourTiles paint={colours} value={paint} onChange={setPaint} />
        ) : null}
        <Stack direction="row" sx={{ alignItems: "center", gap: 2 }}>
          <Button type="submit" variant="contained" disabled={asked}>
            <FormattedMessage id="archive.finderSearch" />
          </Button>
        </Stack>
        {signIn && !user ? <SignIn /> : null}
        {asked ? (
          <Alert severity="info">
            <FormattedMessage id="archive.searchRequestSoon" />
          </Alert>
        ) : null}
      </Stack>
    </Card>
  );
}
