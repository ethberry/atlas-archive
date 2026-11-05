"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { Article } from "@/components/archive/Article";
import { ITEMS, type ItemClass, type ItemRow } from "@/lib/archive/items";
import {
  CARD_NEAR,
  damageCard,
  damageFromCard,
  scannerCard,
  scannerFromCard,
  shipLuck,
  toolLuck,
  type Cell,
  type Luck,
  type Reading,
} from "@/lib/archive/luck";

// The grids supercharged slots are marked on: the technology inventory of a
// multitool, 7 by 4, and of a ship, 10 by 3 (`docs/multitools/inventory.md`).
const TOOL_GRID = { columns: 7, rows: 4 };
const SHIP_GRID = { columns: 10, rows: 3 };

// Class S, the last of C, B, A, S: the class a form starts at.
const TOP_CLASS = 3;

// The most supercharged slots any item holds, at class S.
const MOST_SLOTS = 4;

// The words of a field, by its message in `lib/i18n` under `luck`.
const FIELD_NAMES: Record<string, string> = {
  damage: "luck.fieldDamage",
  mining: "luck.fieldMining",
  scanner: "luck.fieldScanner",
  shield: "luck.fieldShield",
  hyperdrive: "luck.fieldHyperdrive",
  agile: "luck.fieldAgile",
};

// The words for a score: our own cut points, not the game's. 50 is the median
// item; 80 and 95 are one item in five and one in twenty; under 20, one in
// five is worse.
const VERDICTS: [number, string][] = [
  [95, "luck.verdictExtreme"],
  [80, "luck.verdictLucky"],
  [50, "luck.verdictBetter"],
  [20, "luck.verdictWorse"],
];

function verdict(score: number) {
  const found = VERDICTS.find(([from]) => score >= from);
  return found ? found[1] : "luck.verdictNot";
}

// The name of a type: a tool's body or a ship's hull.
function typeName(ship: boolean, key: string) {
  return `${ship ? "hull" : "toolBody"}.${key}`;
}

function SlotGrid(props: {
  size: { columns: number; rows: number };
  cells: Cell[];
  onChange: (cells: Cell[]) => void;
}) {
  const { size, cells, onChange } = props;
  const intl = useIntl();
  const toggle = (x: number, y: number) => {
    const held = cells.some((cell) => cell[0] === x && cell[1] === y);
    if (held) {
      onChange(cells.filter((cell) => cell[0] !== x || cell[1] !== y));
    } else if (cells.length < MOST_SLOTS) {
      onChange([...cells, [x, y]]);
    }
  };
  return (
    <Box
      role="group"
      aria-label={intl.formatMessage({ id: "luck.slots" })}
      sx={{
        display: "grid",
        gridTemplateColumns: `repeat(${size.columns}, minmax(0, 40px))`,
        gap: 0.5,
      }}
    >
      {Array.from({ length: size.rows * size.columns }, (_, at) => {
        const x = at % size.columns;
        const y = Math.floor(at / size.columns);
        const held = cells.some((cell) => cell[0] === x && cell[1] === y);
        return (
          <Box
            key={at}
            component="button"
            type="button"
            aria-pressed={held}
            aria-label={intl.formatMessage(
              { id: "luck.slot" },
              { column: x + 1, row: y + 1 },
            )}
            onClick={() => toggle(x, y)}
            sx={{
              aspectRatio: "1",
              p: 0,
              cursor: "pointer",
              border: 1,
              borderColor: held ? "primary.main" : "divider",
              borderRadius: 1,
              bgcolor: held ? "primary.main" : "transparent",
            }}
          />
        );
      })}
    </Box>
  );
}

function ReadingText(props: { reading: Reading }) {
  const { reading } = props;
  const intl = useIntl();
  const name = intl.formatMessage({ id: FIELD_NAMES[reading.field] });
  return reading.kind !== "ok" ? (
    <FormattedMessage id="luck.readingMisfit" values={{ name }} />
  ) : (
    <FormattedMessage
      id="luck.readingBetter"
      values={{ name, share: Math.round(reading.better * 100) }}
    />
  );
}

function foundText(found: Luck["found"]) {
  if (found === "upgradedStaff") {
    return "luck.foundUpgradedStaff";
  }
  if (found === "upgraded") {
    return "luck.foundUpgraded";
  }
  return null;
}

function slotText(slots: Luck["slots"], klass: number) {
  if (slots === "none" || slots === "partial") {
    return klass < TOP_CLASS ? "luck.slotsBelowS" : "luck.slotsMarkAll";
  }
  if (slots === "square") {
    return "luck.slotsSquare";
  }
  if (slots === "adjacent") {
    return "luck.slotsAdjacent";
  }
  return "luck.slotsScattered";
}

function Verdict(props: { luck: Luck; klass: number }) {
  const { luck, klass } = props;
  const { score } = luck;
  const intl = useIntl();
  const found = foundText(luck.found);
  return (
    <Card variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5} aria-live="polite">
        {score === null ? (
          <Typography variant="h6">
            <FormattedMessage
              id={luck.readings.length ? "luck.misfit" : "luck.enter"}
            />
          </Typography>
        ) : (
          <>
            <Typography variant="h5">
              <FormattedMessage
                id="luck.score"
                values={{
                  score,
                  verdict: intl.formatMessage({ id: verdict(score) }),
                }}
              />
            </Typography>
            <LinearProgress
              variant="determinate"
              value={score}
              aria-label={intl.formatMessage({ id: "luck.scoreLabel" })}
              sx={{ height: 10, borderRadius: 1 }}
            />
          </>
        )}
        {found ? (
          <Typography variant="body2">
            <FormattedMessage id={found} />
          </Typography>
        ) : null}
        {luck.readings.map((reading) => (
          <Typography key={reading.field} variant="body2">
            <ReadingText reading={reading} />
          </Typography>
        ))}
        {score !== null || luck.slots !== "none" ? (
          <Typography variant="body2">
            <FormattedMessage id={slotText(luck.slots, klass)} />
          </Typography>
        ) : null}
      </Stack>
    </Card>
  );
}

type Limit = [number, number];

// The numbers a tool's card shows. Mining shows on none, so it is not asked.
const TOOL_FIELDS = ["damage", "scanner"];

// What a field takes, as the game shows it. A stat the type and class do not
// hold has none. A ship's card number has its row; a tool's Scanner Range is
// 200 × (1 + base%), and its Damage Potential the card of its weapon: a beam
// on an Atlantid, a Boltcaster on every other type (`damageCard`).
function limitOf(
  held: ItemClass,
  ship: boolean,
  name: string,
  type: string,
): Limit | null {
  if (ship) {
    return held.limits?.[ITEMS.shipStats.indexOf(name)] ?? null;
  }
  const range = held.ranges[ITEMS.toolStats.indexOf(name)];
  if (range[1] <= 0) {
    return null;
  }
  if (name === "scanner") {
    return [scannerCard(range[0]), scannerCard(range[1])];
  }
  return [damageCard(range[0], type), damageCard(range[1], type)];
}

// A number printed with one decimal, without `.0`.
function oneDecimal(value: number) {
  return value.toFixed(1).replace(/\.0$/, "");
}

function card<T>(value: number | null, read: (value: number) => T) {
  return value === null || value <= 0 ? null : read(value);
}

function parsed(value: string | undefined) {
  const number = Number(value);
  return value && Number.isFinite(number) ? number : null;
}

// The supercharged slots a class holds: one at C, up to four at S.
function slotsOf(klass: number) {
  return klass + 1;
}

type FormValues = {
  type: string;
  head: string;
  klass: number;
  cells: Cell[];
  fields: Record<string, string>;
};

// The scored form: nothing is scored until Submit, and Submit asks for every
// field the type and class hold, inside its range, and no more supercharged
// slots than the class holds. Fewer are fine: a slot can stay closed.
function ItemForm(props: { ship: boolean; rows: ItemRow[]; hidden: boolean }) {
  const { hidden, rows, ship } = props;
  const intl = useIntl();
  const defaults: FormValues = {
    type: rows[0].key,
    head: ITEMS.staffHeads[0],
    klass: TOP_CLASS,
    cells: [],
    fields: {},
  };
  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: defaults,
  });
  const [result, setResult] = useState<{
    luck: Luck;
    klass: number;
    of: string;
  } | null>(null);
  const values = useWatch({ control }) as FormValues;
  const { type, klass, cells } = values;
  // A score holds only for the values it was made from: any change hides it
  // until the next Submit.
  const shown = result && result.of === JSON.stringify(values) ? result : null;
  const heldBy = (key: string, at: number) =>
    (rows.find((row) => row.key === key) ?? rows[0]).classes[at];
  const held = heldBy(type, klass);
  const names = ship ? ITEMS.shipStats : TOOL_FIELDS;
  const open = names.filter((name) => limitOf(held, ship, name, type));
  const score = (data: FormValues) => {
    const field = (name: string) =>
      open.includes(name) ? parsed(data.fields[name]) : null;
    const luck = ship
      ? shipLuck({
          type: data.type,
          klass: data.klass,
          cells: data.cells,
          stats: names.map(field),
        })
      : toolLuck({
          type: data.type,
          klass: data.klass,
          cells: data.cells,
          damage: card(field("damage"), (value) =>
            damageFromCard(value, data.type),
          ),
          scanner: card(field("scanner"), scannerFromCard),
        });
    setResult({ luck, klass: data.klass, of: JSON.stringify(values) });
  };
  const fewer = cells.length > 0 && cells.length < slotsOf(klass);
  return (
    <Stack
      component="form"
      noValidate
      spacing={2}
      onSubmit={handleSubmit(score)}
      sx={hidden ? { display: "none" } : undefined}
    >
      <Grid container spacing={2}>
        {rows.length > 1 ? (
          <Grid size={{ xs: 12, sm: 8 }}>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  size="small"
                  label={intl.formatMessage({
                    id: ship ? "luck.shipType" : "luck.type",
                  })}
                >
                  {rows.map((row) => (
                    <MenuItem key={row.key} value={row.key}>
                      <FormattedMessage id={typeName(ship, row.key)} />
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
        ) : null}
        {rows[0].key === "staff" ? (
          <Grid size={{ xs: 12, sm: 8 }}>
            <Controller
              name="head"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  size="small"
                  label={intl.formatMessage({ id: "luck.head" })}
                  helperText={intl.formatMessage({ id: "luck.headHelp" })}
                >
                  {ITEMS.staffHeads.map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
        ) : null}
        <Grid size={{ xs: 12, sm: rows[0].key === "interceptor" ? 12 : 4 }}>
          <Controller
            name="klass"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                onChange={(event) => field.onChange(Number(event.target.value))}
                select
                fullWidth
                size="small"
                label={intl.formatMessage({ id: "luck.class" })}
              >
                {ITEMS.classes.map((name, at) => (
                  <MenuItem key={name} value={at}>
                    {name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
      </Grid>
      <Controller
        name="cells"
        control={control}
        rules={{
          validate: (value) =>
            value.length <= slotsOf(klass) ||
            intl.formatMessage(
              { id: "luck.tooManySlots" },
              { klass: ITEMS.classes[klass], count: slotsOf(klass) },
            ),
        }}
        render={({ field, fieldState }) => (
          <Stack spacing={1}>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
              <Typography variant="subtitle2">
                <FormattedMessage id="luck.slots" />
              </Typography>
              {fewer ? (
                <Tooltip
                  title={intl.formatMessage(
                    { id: "luck.fewerSlots" },
                    { count: slotsOf(klass) },
                  )}
                >
                  <Box
                    component="span"
                    tabIndex={0}
                    aria-label={intl.formatMessage(
                      { id: "luck.fewerSlots" },
                      { count: slotsOf(klass) },
                    )}
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      border: 1,
                      borderColor: "text.secondary",
                      color: "text.secondary",
                      fontSize: 12,
                      lineHeight: "16px",
                      textAlign: "center",
                      cursor: "help",
                    }}
                  >
                    ?
                  </Box>
                </Tooltip>
              ) : null}
            </Stack>
            <SlotGrid
              size={ship ? SHIP_GRID : TOOL_GRID}
              cells={field.value}
              onChange={field.onChange}
            />
            {fieldState.error ? (
              <Typography variant="caption" color="error">
                {fieldState.error.message}
              </Typography>
            ) : null}
          </Stack>
        )}
      />
      <Grid container spacing={2}>
        {open.map((name) => {
          const limit = limitOf(held, ship, name, type) as Limit;
          const range = intl.formatMessage(
            { id: "luck.asShownRange" },
            { low: oneDecimal(limit[0]), high: oneDecimal(limit[1]) },
          );
          return (
            <Grid
              key={`${type}.${klass}.${name}`}
              size={{ xs: 12, sm: 6, md: 3 }}
            >
              <Controller
                name={`fields.${name}`}
                control={control}
                rules={{
                  validate: (value) => {
                    const number = parsed(value);
                    if (number === null) {
                      return intl.formatMessage({ id: "luck.required" });
                    }
                    return (
                      (number >= limit[0] - CARD_NEAR &&
                        number <= limit[1] + CARD_NEAR) ||
                      range
                    );
                  },
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ""}
                    fullWidth
                    size="small"
                    type="number"
                    label={intl.formatMessage({ id: FIELD_NAMES[name] })}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message ?? range}
                    slotProps={{ htmlInput: { step: "any" } }}
                  />
                )}
              />
            </Grid>
          );
        })}
      </Grid>
      <Stack direction="row" spacing={1}>
        <Button type="submit" variant="contained">
          <FormattedMessage id="luck.submit" />
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            reset(defaults);
            setResult(null);
          }}
        >
          <FormattedMessage id="luck.clear" />
        </Button>
      </Stack>
      {shown ? <Verdict luck={shown.luck} klass={shown.klass} /> : null}
    </Stack>
  );
}

const staffs = (row: ItemRow) => row.key === "staff";
const interceptors = (row: ItemRow) => row.key === "interceptor";

const TABS = [
  {
    slug: "multitool",
    label: "luck.tabMultitool",
    ship: false,
    rows: ITEMS.tools.filter((row) => !staffs(row)),
  },
  {
    slug: "staff",
    label: "luck.tabStaff",
    ship: false,
    rows: ITEMS.tools.filter(staffs),
  },
  {
    slug: "ship",
    label: "luck.tabShip",
    ship: true,
    rows: ITEMS.ships.filter((row) => !interceptors(row)),
  },
  {
    slug: "interceptor",
    label: "luck.tabInterceptor",
    ship: true,
    rows: ITEMS.ships.filter(interceptors),
  },
];

// Every form stays mounted, so a tab keeps what was entered in it. The tab goes in
// the address, so it can be linked.
function Calculator(props: { first: number }) {
  const [tab, setTab] = useState(props.first);
  const intl = useIntl();
  return (
    <Stack spacing={2}>
      <Tabs
        value={tab}
        variant="scrollable"
        allowScrollButtonsMobile
        onChange={(_, next: number) => {
          setTab(next);
          window.history.replaceState(null, "", `?tab=${TABS[next].slug}`);
        }}
        aria-label={intl.formatMessage({ id: "luck.tabs" })}
      >
        {TABS.map((row) => (
          <Tab key={row.slug} label={intl.formatMessage({ id: row.label })} />
        ))}
      </Tabs>
      {TABS.map((row, at) => (
        <ItemForm
          key={row.slug}
          ship={row.ship}
          rows={row.rows}
          hidden={at !== tab}
        />
      ))}
    </Stack>
  );
}

export function LuckCalculator(props: { html: string; tab?: string }) {
  const first = Math.max(
    0,
    TABS.findIndex((row) => row.slug === props.tab),
  );
  return (
    <Article
      html={props.html}
      widgets={{ calculator: () => <Calculator first={first} /> }}
    />
  );
}
