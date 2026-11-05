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
import { Controller, useForm, type Control } from "react-hook-form";
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
  const { control, getValues, handleSubmit } = useForm<CatalogQuery>({
    defaultValues: query,
  });

  function submit(next: CatalogQuery) {
    const cleared = { ...next, page: 1 };
    // Stay where the form is; the address keeps the filters for a link.
    router.push(`${pathname}${toSearchParams(cleared, 1)}`, { scroll: false });
  }

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit(submit)}>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
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
        )}
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
              control={control}
              // A list or a box applies at once; the name waits for Enter.
              onApply={() => submit(getValues())}
            />
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}

function FilterControl(props: {
  field: FilterField;
  control: Control<CatalogQuery>;
  onApply: () => void;
}) {
  const { field, control, onApply } = props;
  const intl = useIntl();
  if (field.type === "check") {
    return (
      <Controller
        name={field.param}
        control={control}
        render={({ field: input }) => (
          <FormControlLabel
            control={
              <Checkbox
                checked={input.value}
                onChange={(event) => {
                  input.onChange(event.target.checked);
                  onApply();
                }}
              />
            }
            label={<FormattedMessage id={`archive.${field.param}`} />}
          />
        )}
      />
    );
  }
  const label = intl.formatMessage({ id: `archive.${field.param}` });
  return (
    <Controller
      name={field.param}
      control={control}
      render={({ field: input }) => (
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel id={`${field.param}-label`} shrink>
            {label}
          </InputLabel>
          <Select
            labelId={`${field.param}-label`}
            label={label}
            value={input.value}
            displayEmpty
            onChange={(event) => {
              input.onChange(event.target.value);
              onApply();
            }}
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
      )}
    />
  );
}
