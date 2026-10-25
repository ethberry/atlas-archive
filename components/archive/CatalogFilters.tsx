"use client";

import SearchIcon from "@mui/icons-material/Search";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import {
  filtersFor,
  toSearchParams,
  type CatalogQuery,
  type FilterField,
} from "@/lib/archive/query";

export function CatalogFilters(props: {
  pathname: string;
  query: CatalogQuery;
}) {
  const { pathname, query } = props;
  return (
    <CatalogFiltersForm
      key={JSON.stringify(query)}
      pathname={pathname}
      query={query}
    />
  );
}

function CatalogFiltersForm(props: { pathname: string; query: CatalogQuery }) {
  const { pathname, query } = props;
  const router = useRouter();
  const intl = useIntl();
  const fields = filtersFor(query.kinds);
  const [name, setName] = useState(query.name);
  const [draft, setDraft] = useState(query);

  function submit(next: CatalogQuery) {
    const cleared = { ...next, name, page: 1 };
    router.push(`${pathname}${toSearchParams(cleared, 1)}`);
  }

  return (
    <Stack
      component="form"
      spacing={2}
      onSubmit={(event) => {
        event.preventDefault();
        submit(draft);
      }}
    >
      <TextField
        value={name}
        onChange={(event) => setName(event.target.value)}
        label={intl.formatMessage({ id: "archive.name" })}
        fullWidth
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  type="submit"
                  aria-label={intl.formatMessage({ id: "archive.search" })}
                >
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      {fields.length > 0 ? (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          useFlexGap
          sx={{ flexWrap: "wrap" }}
        >
          {fields.map((field) => (
            <FilterControl
              key={field.param}
              field={field}
              query={draft}
              onChange={(next) => setDraft(next)}
            />
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}

function FilterControl(props: {
  field: FilterField;
  query: CatalogQuery;
  onChange: (query: CatalogQuery) => void;
}) {
  const { field, query, onChange } = props;
  const intl = useIntl();
  if (field.type === "check") {
    return (
      <FormControlLabel
        control={
          <Checkbox
            checked={query[field.param]}
            onChange={(event) =>
              onChange({ ...query, [field.param]: event.target.checked })
            }
          />
        }
        label={
          <FormattedMessage
            id={
              field.param === "gasGiant"
                ? "archive.gasGiant"
                : "archive.dissonance"
            }
          />
        }
      />
    );
  }
  const label = intl.formatMessage({
    id: `archive.${field.param === "toolBody" ? "toolBody" : field.param}`,
  });
  return (
    <FormControl sx={{ minWidth: 180 }} size="small">
      <InputLabel id={`${field.param}-label`}>{label}</InputLabel>
      <Select
        labelId={`${field.param}-label`}
        label={label}
        value={query[field.param]}
        displayEmpty
        onChange={(event) =>
          onChange({ ...query, [field.param]: event.target.value })
        }
      >
        <MenuItem value="">
          <FormattedMessage id="archive.any" />
        </MenuItem>
        {field.options.map((option) => (
          <MenuItem key={option} value={option}>
            <FormattedMessage
              id={`${field.group}.${option}`}
              defaultMessage={option}
            />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
