"use client";

import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import { Fragment, useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { useSnackbar } from "notistack";

import Link from "next/link";

import { DonationBlock } from "@/components/archive/DonationBlock";
import { LikeButton } from "@/components/archive/LikeButton";
import { link } from "@/components/archive/RecordNote";
import { FINDERS_ENABLED } from "@/lib/archive/features";
import {
  readFeed,
  type CatalogRow,
  type FeedSection,
} from "@/lib/archive/read";
import { getBrowserSupabase } from "@/lib/db/supabase.browser";

const SECTIONS: { id: FeedSection; title: string }[] = [
  { id: "galaxies", title: "archive.galaxies" },
  { id: "top", title: "archive.topRated" },
];

// The site's question and where each answer lives.
const LEAD = {
  tools: link("/tool"),
  ships: link("/ship"),
  creatures: link("/creature"),
  guides: link("/guides"),
  lucky: link("/how-lucky-am-i"),
  interceptor: link("/interceptor-finder"),
  capital: link("/capital-freighter-finder"),
  about: link("/about"),
};

export function HomeScreen(props: { confession: string }) {
  const { confession } = props;
  return (
    <Stack spacing={6}>
      <Stack spacing={1}>
        <Typography variant="h4" component="h1">
          <FormattedMessage id="archive.homeTitle" />
        </Typography>
        <Typography color="text.secondary">
          <FormattedMessage
            id={
              FINDERS_ENABLED ? "archive.homeLeadFinders" : "archive.homeLead"
            }
            values={LEAD}
          />
        </Typography>
      </Stack>
      {SECTIONS.map((section) => (
        <Fragment key={section.id}>
          <FeedBlock section={section.id} title={section.title} />
          {section.id === "galaxies" ? <Confession html={confession} /> : null}
        </Fragment>
      ))}
      <DonationBlock />
    </Stack>
  );
}

// The author's note, already rendered from content/LOCALE/confession.md.
function Confession(props: { html: string }) {
  const { html } = props;
  return (
    <Card variant="outlined">
      <CardContent
        sx={(theme) => ({
          "& h2": { ...theme.typography.h5, mt: 0 },
          "& p": { ...theme.typography.body1, color: "text.secondary" },
          "& p:last-child": { mb: 0 },
        })}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </Card>
  );
}

function FeedBlock(props: { section: FeedSection; title: string }) {
  const { section, title } = props;
  const { enqueueSnackbar } = useSnackbar();
  const feed = useQuery({
    queryKey: ["feed", section],
    queryFn: async () => {
      const supabase = getBrowserSupabase();
      if (!supabase) {
        throw new Error("The archive could not be read.");
      }
      return readFeed(supabase, section);
    },
  });

  useEffect(() => {
    if (feed.error instanceof Error) {
      enqueueSnackbar(feed.error.message, { variant: "error" });
    }
  }, [enqueueSnackbar, feed.error]);

  return (
    <Stack spacing={1}>
      <Typography variant="h4" component="h2">
        <FormattedMessage id={title} />
      </Typography>
      {feed.isPending ? (
        <Typography>
          <FormattedMessage id="archive.loading" />
        </Typography>
      ) : null}
      {feed.isError ? (
        <Typography color="text.secondary">
          <FormattedMessage id="archive.unavailable" />
        </Typography>
      ) : null}
      {feed.data && feed.data.length === 0 ? (
        <Typography color="text.secondary">
          <FormattedMessage id="archive.empty" />
        </Typography>
      ) : null}
      {feed.data && feed.data.length > 0 ? (
        <Grid container spacing={2}>
          {feed.data.map((row) => (
            <Grid
              key={row.id}
              size={
                section === "galaxies"
                  ? { xs: 12, md: 6 }
                  : { xs: 12, sm: 6, md: 4, lg: 3 }
              }
            >
              <FeedCard row={row} />
            </Grid>
          ))}
        </Grid>
      ) : null}
    </Stack>
  );
}

// One home-page card: the picture, then the name with the like button beside
// it (galaxies have none).
function FeedCard(props: { row: CatalogRow }) {
  const { row } = props;
  return (
    <Card variant="outlined">
      <CardActionArea component={Link} href={`/${row.kind}/${row.id}`}>
        <CardMedia
          component="img"
          height="220"
          image={row.image ?? "/assets/img/no-image.svg"}
          alt={row.name}
          sx={{ objectFit: "cover" }}
        />
      </CardActionArea>
      <CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}>
        <Stack direction="row" sx={{ alignItems: "center" }}>
          <Typography
            variant="h6"
            component={Link}
            href={`/${row.kind}/${row.id}`}
            sx={{ flexGrow: 1, color: "inherit", textDecoration: "none" }}
          >
            {row.name}
          </Typography>
          {row.kind === "galaxy" ? null : (
            <LikeButton
              id={row.id}
              kind={row.kind}
              liked={row.liked}
              count={row.likeCount}
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
