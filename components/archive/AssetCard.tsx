"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import MuiLink from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormattedMessage } from "react-intl";

import { LikeButton } from "@/components/archive/LikeButton";
import { PictureGallery } from "@/components/archive/PictureGallery";
import { VerifiedMark } from "@/components/archive/VerifiedMark";
import { explainHref } from "@/lib/archive/explain";
import type { Kind } from "@/lib/archive/kinds";
import type {
  AssetCard as AssetCardData,
  Field,
  SlotCell,
} from "@/lib/archive/read";

// A creature's battle grades stand under its picture.
const BATTLE = new Set(["archive.combat", "archive.agility", "archive.health"]);

// What a system holds in its space, beside what the system is: the right
// column of a system, which has no picture.
const SPACE = new Set([
  "archive.hulks",
  "archive.asteroidBelts",
  "archive.iceFields",
  "archive.relicGate",
]);

// The label column of a text row: one width, so every value starts at the
// same distance from its label.
const LABEL = { flex: "0 0 180px" };

// The record's fields, then "how to get it" in a block of its own.
export function AssetCard(props: { asset: AssetCardData }) {
  const { asset } = props;
  const steps = asset.fields.filter((field) => field.type === "steps");
  const fields = asset.fields.filter(
    (field) =>
      field.type !== "steps" &&
      field.type !== "slots" &&
      !BATTLE.has(field.label) &&
      !SPACE.has(field.label),
  );
  const space = asset.fields.filter((field) => SPACE.has(field.label));
  // Two columns of fields need more room than fields beside a picture: a
  // system lays its space beside the rest only from the medium width on.
  const wide = space.length > 0 ? "md" : "sm";
  const slots = asset.fields.filter((field) => field.type === "slots");
  const battle = asset.fields.filter((field) => BATTLE.has(field.label));
  // Systems, planets, and stations take no pictures yet, so they show none.
  const pictured =
    asset.kind !== "system" &&
    asset.kind !== "planet" &&
    asset.kind !== "building";
  // A staff is a tool row that names the head it is built from.
  const kindWord = asset.fields.some(
    (field) => field.label === "archive.headItem",
  )
    ? "staff"
    : asset.kind;
  return (
    <Stack spacing={2}>
      <Card variant="outlined">
        <CardContent>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", mb: 2 }}
          >
            <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
              {asset.name}
            </Typography>
            {asset.verified ? <VerifiedMark /> : null}
            <LikeButton
              id={asset.id}
              kind={asset.kind}
              liked={asset.liked}
              count={asset.likeCount}
            />
          </Stack>
          {/* The text keeps its place on the left; the picture and the slots
              share one column on the right that shrinks first. On a narrow
              screen that column comes first, under the title. A system's
              space takes that column and stays below on a narrow screen. */}
          <Stack
            direction={{
              xs: pictured ? "column-reverse" : "column",
              [wide]: "row",
            }}
            spacing={3}
            sx={{ alignItems: { xs: "center", [wide]: "flex-start" } }}
          >
            <Box sx={{ flex: { [wide]: "2 1 0" }, minWidth: 0, width: "100%" }}>
              <Stack spacing={1}>
                <Stack direction="row" spacing={2}>
                  <Typography sx={LABEL} color="text.secondary">
                    <FormattedMessage id="archive.type" />
                  </Typography>
                  <Typography>
                    {/* The kind leads to its list in the catalog. */}
                    <MuiLink
                      component={Link}
                      href={`/${asset.kind}`}
                      color="inherit"
                    >
                      <FormattedMessage id={`kind.${kindWord}`} />
                    </MuiLink>
                  </Typography>
                </Stack>
                {fields.map((field) => (
                  <FieldLine
                    key={field.label}
                    field={field}
                    kind={asset.kind}
                  />
                ))}
              </Stack>
            </Box>
            {pictured ? (
              <Stack
                spacing={2}
                sx={{
                  flex: { sm: "1 1 0" },
                  minWidth: 0,
                  width: "100%",
                  // Alone in a narrow layout it must not fill the screen.
                  maxWidth: { xs: 360, sm: "none" },
                }}
              >
                <PictureGallery
                  id={asset.id}
                  name={asset.name}
                  images={asset.images}
                  uploadable={asset.uploadable}
                />
                {battle.length > 0 ? (
                  <Stack spacing={0.5}>
                    {battle.map((field) => (
                      <Stack
                        key={field.label}
                        direction="row"
                        sx={{ justifyContent: "space-between" }}
                      >
                        <Typography color="text.secondary">
                          <FieldLabel kind={asset.kind} label={field.label} />
                        </Typography>
                        <Typography component="div">
                          <FieldValue field={field} />
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                ) : null}
                {slots.map((field) => (
                  <Stack key={field.label} spacing={1}>
                    <Typography color="text.secondary">
                      <FieldLabel kind={asset.kind} label={field.label} />
                    </Typography>
                    <FieldValue field={field} />
                  </Stack>
                ))}
              </Stack>
            ) : null}
            {space.length > 0 ? (
              <Stack
                spacing={1}
                sx={{ flex: { [wide]: "1 1 0" }, minWidth: 0, width: "100%" }}
              >
                {space.map((field) => (
                  <FieldLine
                    key={field.label}
                    field={field}
                    kind={asset.kind}
                  />
                ))}
              </Stack>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
      {steps.map((field) => (
        <Card key={field.label} variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <FormattedMessage id={field.label} />
            </Typography>
            {field.type === "steps" && field.glyphs ? (
              <Stack
                direction="row"
                spacing={2}
                sx={{ alignItems: "center", mb: 1 }}
              >
                <Typography sx={LABEL} color="text.secondary">
                  <FormattedMessage id="archive.portalGlyphs" />
                </Typography>
                <Glyphs code={field.glyphs} />
              </Stack>
            ) : null}
            <Typography component="div">
              <FieldValue field={field} />
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

// A label, linked to the Statistics page that explains it when there is one.
function FieldLabel(props: { kind: Kind; label: string }) {
  const { kind, label } = props;
  const href = explainHref(kind, label);
  if (!href) {
    return <FormattedMessage id={label} />;
  }
  return (
    <MuiLink component={Link} href={href} color="inherit">
      <FormattedMessage id={label} />
    </MuiLink>
  );
}

function FieldLine(props: { field: Field; kind: Kind }) {
  const { field, kind } = props;
  return (
    <Stack direction="row" spacing={2}>
      <Typography sx={LABEL} color="text.secondary">
        <FieldLabel kind={kind} label={field.label} />
      </Typography>
      <Typography
        component="div"
        sx={{ flexGrow: 1, minWidth: 0, overflowWrap: "anywhere" }}
      >
        <FieldValue field={field} />
      </Typography>
    </Stack>
  );
}

// The class colours of the game's cards: the class at which a cell opens.
const RANK_COLOUR: Record<string, string> = {
  C: "#3fbf6f",
  B: "#3f9fe0",
  A: "#a66be0",
  S: "#f0a030",
};

// The supercharged cells on the generation rectangle. A cell is filled from
// its centre outwards, strongest at the edge, in the colour of the class at
// which it opens; the other cells are only outlined.
function SlotGrid(props: { width: number; height: number; cells: SlotCell[] }) {
  const { width, height, cells } = props;
  const ranks = RANK_ORDER.filter((rank) =>
    cells.some((cell) => cell.rank === rank),
  );
  return (
    <Stack spacing={1}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${width}, 1fr)`,
          gap: "6px",
          width: "100%",
        }}
      >
        {Array.from({ length: width * height }, (_, index) => {
          const column = index % width;
          const row = Math.floor(index / width);
          const cell = cells.find(
            (item) => item.column === column && item.row === row,
          );
          const colour = cell ? RANK_COLOUR[cell.rank] : null;
          return (
            <Box
              key={index}
              title={
                cell ? `${column},${row} · ${cell.rank}` : `${column},${row}`
              }
              sx={{
                aspectRatio: "1",
                borderRadius: "4px",
                border: "1px solid",
                borderColor: colour ?? "divider",
                background: colour
                  ? `radial-gradient(circle, ${colour}33 0%, ${colour}99 70%, ${colour} 100%)`
                  : "transparent",
              }}
            />
          );
        })}
      </Box>
      <Stack
        direction="row"
        useFlexGap
        sx={{ flexWrap: "wrap", columnGap: 2, rowGap: 0.5 }}
      >
        {ranks.map((rank) => (
          <Stack
            key={rank}
            direction="row"
            spacing={0.5}
            sx={{ alignItems: "center" }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "2px",
                background: RANK_COLOUR[rank],
              }}
            />
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage id="archive.opensAt" values={{ rank }} />
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}

// The legend starts at the highest class, so S keeps its place.
const RANK_ORDER = ["S", "A", "B", "C"];

// Twelve portal glyphs drawn with the glyph font.
export function Glyphs(props: { code: string }) {
  const { code } = props;
  return (
    <Box
      component="span"
      aria-label={code}
      sx={{
        fontFamily: "var(--font-glyphs)",
        fontSize: "1.75rem",
        letterSpacing: "0.15em",
        lineHeight: 1.2,
      }}
    >
      {code}
    </Box>
  );
}

function FieldValue(props: { field: Field }) {
  const { field } = props;
  // A place row of the record itself stays plain text: no link to this page.
  const here = usePathname();
  if (field.type === "slots") {
    if (field.cells.length === 0) {
      return <FormattedMessage id="archive.absent" />;
    }
    return (
      <SlotGrid width={field.width} height={field.height} cells={field.cells} />
    );
  }
  if (field.type === "glyphs") {
    if (!field.glyphs) {
      return <FormattedMessage id="archive.absent" />;
    }
    return <Glyphs code={field.glyphs} />;
  }
  if (field.type === "steps") {
    if (field.steps.length === 0) {
      return <FormattedMessage id="archive.absent" />;
    }
    return (
      <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
        {field.steps.map((step) => (
          <li key={step.id}>
            <FormattedMessage
              id={step.id}
              values={{
                ...step.values,
                habitat: step.values.habitat ? (
                  <FormattedMessage id={`habitat.${step.values.habitat}`} />
                ) : undefined,
                time: step.values.time ? (
                  <FormattedMessage id={`activeTime.${step.values.time}`} />
                ) : undefined,
              }}
            />
          </li>
        ))}
      </Box>
    );
  }
  if (field.type === "flag") {
    if (field.value === null) {
      return <FormattedMessage id="archive.absent" />;
    }
    return <FormattedMessage id={field.value ? "archive.yes" : "archive.no"} />;
  }
  if (field.type === "terms") {
    if (field.values.length === 0) {
      return <FormattedMessage id="archive.absent" />;
    }
    return field.values.map((value, index) => (
      <span key={value}>
        {index > 0 ? ", " : null}
        <FormattedMessage
          id={`${field.group}.${value}`}
          defaultMessage={value}
        />
      </span>
    ));
  }
  if (field.type === "term") {
    if (!field.value) {
      return <FormattedMessage id="archive.absent" />;
    }
    return (
      <FormattedMessage
        id={`${field.group}.${field.value}`}
        defaultMessage={field.value}
      />
    );
  }
  if (!field.text) {
    return <FormattedMessage id="archive.absent" />;
  }
  if (field.href && field.href !== here) {
    return (
      <MuiLink component={Link} href={field.href} color="inherit">
        {field.text}
      </MuiLink>
    );
  }
  return field.text;
}
