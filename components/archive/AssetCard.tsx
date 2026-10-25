"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { FormattedMessage } from "react-intl";

import { LikeButton } from "@/components/archive/LikeButton";
import type { AssetCard as AssetCardData, Field } from "@/lib/archive/read";

export function AssetCard(props: { asset: AssetCardData }) {
  const { asset } = props;
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            {asset.name}
          </Typography>
          <LikeButton id={asset.id} kind={asset.kind} liked={asset.liked} />
        </Stack>
        <Typography color="text.secondary" gutterBottom>
          <FormattedMessage id={`kind.${asset.kind}`} />
        </Typography>
        <Stack spacing={1}>
          {asset.fields.map((field) => (
            <FieldLine key={field.label} field={field} />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function FieldLine(props: { field: Field }) {
  const { field } = props;
  return (
    <Stack direction="row" spacing={2}>
      <Typography sx={{ minWidth: 180 }} color="text.secondary">
        <FormattedMessage id={field.label} />
      </Typography>
      <Typography>
        <FieldValue field={field} />
      </Typography>
    </Stack>
  );
}

function FieldValue(props: { field: Field }) {
  const { field } = props;
  if (field.type === "flag") {
    if (field.value === null) {
      return <FormattedMessage id="archive.absent" />;
    }
    return <FormattedMessage id={field.value ? "archive.yes" : "archive.no"} />;
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
  return field.text;
}
