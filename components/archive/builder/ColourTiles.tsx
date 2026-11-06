import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { FormattedMessage, useIntl } from "react-intl";

import { MARK, TILE } from "@/components/archive/builder/style";
import {
  NO_PAINT,
  type Band,
  type BandPalette,
  type Paint,
  type ShipPaint,
} from "@/lib/archive/builder/paint";

// The bands as they stand on the ship: the hull above the trim. Where a band
// takes a colour the player has not picked yet, `any` shows.
function Bands(props: { bands: (string | null)[]; any: string }) {
  const { bands, any } = props;
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: 24,
        borderRadius: 0.5,
        overflow: "hidden",
        border: "1px solid #c4c7cc",
      }}
    >
      {bands.map((colour, at) => (
        <Box key={at} sx={{ flex: 1, background: colour ?? any }} />
      ))}
    </Box>
  );
}

const SWATCH = {
  ...TILE,
  width: "auto",
  minWidth: 0,
  px: 0.5,
  fontSize: "0.7rem",
  lineHeight: 1.2,
  textTransform: "none",
};

// One swatch of the colour grid, in px, on a phone and wider.
const SWATCH_SIZE = { xs: 28, sm: 32 };

// Every colour the game paints a band with, as the game holds them.
function PaintTiles(props: {
  paint: BandPalette;
  label: ReactNode;
  value: number | null;
  onChange: (cell: number | null) => void;
}) {
  const { paint, label, value, onChange } = props;
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">{label}</Typography>
      <Box
        role="radiogroup"
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${paint.row}, max-content)`,
          gap: { xs: 0.5, sm: 0.75 },
        }}
      >
        {paint.palette.map((hex, cell) => (
          <Box
            key={cell}
            component="button"
            type="button"
            role="radio"
            aria-checked={cell === value}
            aria-label={hex}
            title={hex}
            onClick={() => onChange(cell === value ? null : cell)}
            sx={{
              width: SWATCH_SIZE,
              height: SWATCH_SIZE,
              p: 0,
              cursor: "pointer",
              borderRadius: 0.5,
              bgcolor: hex,
              border: "1px solid #c4c7cc",
              outline: cell === value ? `3px solid ${MARK}` : "none",
              outlineOffset: 1,
            }}
          />
        ))}
      </Box>
    </Stack>
  );
}

// The bands in the order they show, and the title of each where the ship's paint
// names none of its own.
const BANDS: Band[] = ["hull", "trim", "third"];
const BAND_LABELS: Record<Band, string> = {
  hull: "archive.finderHull",
  trim: "archive.finderTrim",
  third: "archive.finderThird",
};

// The colour: a scheme of the bands, then a colour of the game for each band it
// leaves open. Every form comes in every colour.
export function ColourTiles(props: {
  paint: ShipPaint;
  value: Paint;
  onChange: (value: Paint) => void;
}) {
  const { paint, value, onChange } = props;
  const intl = useIntl();
  const { schemes } = paint;
  const scheme = value.scheme === null ? null : schemes[value.scheme];
  const paletteOf = (band: Band): BandPalette =>
    paint.bands?.[band] ?? {
      palette: paint.palette,
      row: paint.row,
      label: BAND_LABELS[band],
    };
  // The first colour of each row of the palette.
  const any = `linear-gradient(90deg, ${paint.palette.filter((_, cell) => cell % paint.row === 0).join(", ")})`;
  const open = BANDS.filter((band) => scheme?.[band]);
  return (
    <Stack spacing={2}>
      <Stack spacing={1}>
        <Typography variant="subtitle2">
          <FormattedMessage id="archive.finderColour" />
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={value.scheme}
          onChange={(_event, next: number | null) => {
            if (next === null) {
              onChange(NO_PAINT);
              return;
            }
            // A colour stays when the new scheme still uses its band.
            const keep = (band: Band) =>
              schemes[next][band] ? value[band] : null;
            onChange({
              scheme: next,
              hull: keep("hull"),
              trim: keep("trim"),
              third: keep("third"),
            });
          }}
          aria-label={intl.formatMessage({ id: "archive.finderScheme" })}
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: `repeat(${Math.min(schemes.length, 4)}, 1fr)`,
            },
            gap: 0.5,
          }}
        >
          {schemes.map((row, index) => (
            <ToggleButton key={row.id} value={index} sx={SWATCH}>
              <Bands
                any={any}
                bands={paint.bandsOf({
                  scheme: index,
                  hull: index === value.scheme ? value.hull : null,
                  trim: index === value.scheme ? value.trim : null,
                  third: index === value.scheme ? value.third : null,
                })}
              />
              <FormattedMessage id={row.label} />
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>
      {open.map((band) => {
        const palette = paletteOf(band);
        return (
          <PaintTiles
            key={band}
            paint={palette}
            label={<FormattedMessage id={palette.label} />}
            value={value[band]}
            onChange={(cell) => onChange({ ...value, [band]: cell })}
          />
        );
      })}
      {open.length ? (
        <Typography variant="caption">
          <FormattedMessage id={paint.note} />
        </Typography>
      ) : null}
    </Stack>
  );
}
