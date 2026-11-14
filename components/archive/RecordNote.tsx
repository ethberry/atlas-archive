"use client";

import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import type { AssetCard } from "@/lib/archive/read";
import { guidePath } from "@/lib/archive/guides";

// A link for a rich message of react-intl: <tag>words</tag>.
export function link(href: string) {
  return function NoteLink(chunks: ReactNode) {
    return (
      <MuiLink component={Link} href={href}>
        {chunks}
      </MuiLink>
    );
  };
}

const TOOLS = {
  lucky: link("/how-lucky-am-i"),
  finder: link("/interceptor-finder"),
};

// Every guide a note can lead to, by the tag its messages use.
export const GUIDES = {
  classes: link(guidePath("multitool-classes")),
  upgrade: link(guidePath("multitool-upgrades")),
  staffs: link(guidePath("staffs")),
  grades: link(guidePath("creature-grades")),
  roles: link(guidePath("creature-roles")),
  galaxies: link(guidePath("galaxies")),
  systems: link(guidePath("systems")),
  economy: link(guidePath("economy")),
  types: link(guidePath("sources-by-type")),
  dissonance: link(guidePath("sentinels-and-dissonance")),
  stations: link(guidePath("space-stations")),
  upgrades: link(guidePath("technology-merchants")),
  interceptors: link(guidePath("interceptors")),
};

export const SHIP_GUIDES = {
  ...GUIDES,
  classes: link(guidePath("ship-classes")),
  upgrade: link(guidePath("ship-upgrades")),
  finder: TOOLS.finder,
};

type Links = Record<string, (chunks: ReactNode) => ReactNode>;

function termValue(asset: AssetCard, label: string) {
  const field = asset.fields.find((one) => one.label === label);
  return field && field.type === "term" ? field.value : null;
}

// A sentence under a card that leads from the record to the guide or tool on
// it.
export function RecordNote(props: { asset: AssetCard }) {
  const { asset } = props;
  const rank = termValue(asset, "archive.rank");
  const below = rank !== null && rank !== "S";
  const ids: [string, Links][] = [];
  switch (asset.kind) {
    case "galaxy":
      ids.push(["archive.noteGalaxy", GUIDES]);
      break;
    case "system":
      ids.push(["archive.noteSystem", GUIDES]);
      break;
    case "planet":
      ids.push(["archive.notePlanet", GUIDES]);
      break;
    case "building":
      ids.push(["archive.noteStation", GUIDES]);
      break;
    case "creature":
      ids.push(["archive.noteGrades", GUIDES], ["archive.noteRoles", GUIDES]);
      break;
    case "tool":
      // The class guide is linked from the card's Class row, so only a staff
      // gets a sentence of its own here.
      if (termValue(asset, "archive.headItem")) {
        ids.push(["archive.noteStaff", GUIDES]);
      }
      if (below) {
        ids.push(["archive.noteToolBelow", GUIDES]);
      }
      ids.push(["archive.noteLucky", TOOLS]);
      break;
    case "ship":
      if (termValue(asset, "archive.hull") === "interceptor") {
        ids.push(["archive.noteInterceptor", GUIDES]);
        ids.push(["archive.noteFinder", TOOLS]);
      }
      if (below) {
        ids.push(["archive.noteShipBelow", SHIP_GUIDES]);
      }
      ids.push(["archive.noteLucky", TOOLS]);
      break;
  }
  return ids.map(([id, values]) => (
    <Typography key={id} color="text.secondary">
      <FormattedMessage id={id} values={values} />
    </Typography>
  ));
}
