"use client";

import { useState } from "react";
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
import Typography from "@mui/material/Typography";

import { Article } from "@/components/archive/Article";
import { ITEMS, type ItemClass, type ItemRow } from "@/lib/archive/items";
import {
  damageFromCard,
  scannerFromCard,
  shipLuck,
  toolLuck,
  type Cell,
  type Luck,
  type Reading,
} from "@/lib/archive/luck";

const TOOL_GRID = { columns: 7, rows: 4 };
const SHIP_GRID = { columns: 10, rows: 3 };
const TOP_CLASS = 3;

const FIELD_NAMES: Record<string, string> = {
  damage: "Damage Potential",
  mining: "Mining",
  scanner: "Scanner Range",
  shield: "Shield",
  hyperdrive: "Hyperdrive",
  agile: "Maneuverability",
};

function verdict(score: number) {
  if (score >= 95) {
    return "Extremely lucky";
  }
  if (score >= 80) {
    return "Lucky";
  }
  if (score >= 50) {
    return "A little better than most";
  }
  if (score >= 20) {
    return "A little worse than most";
  }
  return "Not lucky";
}

function SlotGrid(props: {
  size: { columns: number; rows: number };
  cells: Cell[];
  onChange: (cells: Cell[]) => void;
}) {
  const { size, cells, onChange } = props;
  const toggle = (x: number, y: number) => {
    const held = cells.some((cell) => cell[0] === x && cell[1] === y);
    if (held) {
      onChange(cells.filter((cell) => cell[0] !== x || cell[1] !== y));
    } else if (cells.length < 4) {
      onChange([...cells, [x, y]]);
    }
  };
  return (
    <Box
      role="group"
      aria-label="Supercharged slots"
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
            aria-label={`Slot, column ${x + 1}, row ${y + 1}`}
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

function readingText(reading: Reading) {
  const name = FIELD_NAMES[reading.field];
  if (reading.kind !== "ok") {
    return `${name} does not fit this type and class.`;
  }
  return `${name}: better than ${Math.round(reading.better * 100)}% of the same type and class.`;
}

function foundText(found: Luck["found"]) {
  if (found === "upgradedStaff") {
    return "This is an upgraded staff. Every staff upgraded to this class holds these same numbers, so there is no luck in them.";
  }
  if (found === "upgraded") {
    return "This damage cannot come with the class, so this tool was upgraded, not found at it.";
  }
  return null;
}

function slotText(slots: Luck["slots"], klass: number) {
  if (slots === "none" || slots === "partial") {
    return klass < TOP_CLASS
      ? "Below class S it holds fewer than four supercharged slots, so slots stay out of the score."
      : "Mark all four supercharged slots to count them.";
  }
  if (slots === "square") {
    return "The four slots form a square, the rarest figure.";
  }
  if (slots === "adjacent") {
    return "The four slots are adjacent.";
  }
  return "The four slots are not adjacent, like most.";
}

function Verdict(props: { luck: Luck; klass: number }) {
  const { luck, klass } = props;
  const { score } = luck;
  const found = foundText(luck.found);
  return (
    <Card variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5} aria-live="polite">
        {score === null ? (
          <Typography variant="h6">
            {luck.readings.length
              ? "These numbers do not fit"
              : "Enter your item"}
          </Typography>
        ) : (
          <>
            <Typography variant="h5">
              {score} of 100: {verdict(score)}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={score}
              aria-label="Luck, from 0 to 100"
              sx={{ height: 10, borderRadius: 1 }}
            />
          </>
        )}
        {found ? <Typography variant="body2">{found}</Typography> : null}
        {luck.readings.map((reading) => (
          <Typography key={reading.field} variant="body2">
            {readingText(reading)}
          </Typography>
        ))}
        {score !== null || luck.slots !== "none" ? (
          <Typography variant="body2">{slotText(luck.slots, klass)}</Typography>
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
// 200 × (1 + base%); Damage Potential depends on the weapon, so it keeps no row.
function limitOf(held: ItemClass, ship: boolean, name: string): Limit | null {
  if (ship) {
    return held.limits?.[ITEMS.shipStats.indexOf(name)] ?? null;
  }
  const range = held.ranges[ITEMS.toolStats.indexOf(name)];
  if (range[1] <= 0) {
    return null;
  }
  if (name === "scanner") {
    const card = (percent: number) =>
      Math.round(200 * (1 + percent / 100) * 10) / 10;
    return [card(range[0]), card(range[1])];
  }
  return [0, 99999];
}

function clamped(value: string, [low, high]: Limit) {
  const number = Number(value);
  if (value === "" || !Number.isFinite(number)) {
    return "";
  }
  return String(Math.min(high, Math.max(low, number)));
}

// A number held inside `limit`. Over the top it stops there at once. Under the
// bottom it waits for the blur, since 3 can be the start of 35.
function NumberField(props: {
  label: string;
  helper: string;
  limit: Limit;
  value: string;
  onChange: (value: string) => void;
}) {
  const { limit, onChange, value } = props;
  return (
    <TextField
      fullWidth
      size="small"
      type="number"
      label={props.label}
      helperText={props.helper}
      value={value}
      onChange={(event) => {
        const next = event.target.value;
        onChange(Number(next) > limit[1] ? String(limit[1]) : next);
      }}
      onBlur={() => onChange(clamped(value, limit))}
      slotProps={{
        htmlInput: { min: limit[0], max: limit[1], step: "any" },
      }}
    />
  );
}

function card<T>(value: number | null, read: (value: number) => T) {
  return value === null || value <= 0 ? null : read(value);
}

function parsed(value: string | undefined) {
  const number = Number(value);
  return value && Number.isFinite(number) ? number : null;
}

function ItemForm(props: { ship: boolean; rows: ItemRow[]; hidden: boolean }) {
  const { hidden, rows, ship } = props;
  const [type, setType] = useState(rows[0].key);
  const [head, setHead] = useState(ITEMS.staffHeads[0]);
  const [klass, setKlass] = useState(TOP_CLASS);
  const [cells, setCells] = useState<Cell[]>([]);
  const [fields, setFields] = useState<Record<string, string>>({});
  const heldBy = (key: string, at: number) =>
    (rows.find((row) => row.key === key) ?? rows[0]).classes[at];
  const held = heldBy(type, klass);
  const names = ship ? ITEMS.shipStats : TOOL_FIELDS;
  const open = names.filter((name) => limitOf(held, ship, name));
  // A number kept from another type or class moves inside the new row.
  const choose = (nextType: string, nextClass: number) => {
    const next = heldBy(nextType, nextClass);
    setType(nextType);
    setKlass(nextClass);
    setFields((now) =>
      Object.fromEntries(
        Object.entries(now).map(([name, value]) => {
          const limit = limitOf(next, ship, name);
          return [name, limit ? clamped(value, limit) : value];
        }),
      ),
    );
  };
  const field = (name: string) =>
    open.includes(name) ? parsed(fields[name]) : null;
  const luck = ship
    ? shipLuck({ type, klass, cells, stats: names.map(field) })
    : toolLuck({
        type,
        klass,
        cells,
        damage: card(field("damage"), (value) => damageFromCard(value, type)),
        scanner: card(field("scanner"), scannerFromCard),
      });
  return (
    <Stack spacing={2} sx={hidden ? { display: "none" } : undefined}>
      <Grid container spacing={2}>
        {rows.length > 1 ? (
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField
              select
              fullWidth
              size="small"
              label={ship ? "Ship type" : "Type"}
              value={type}
              onChange={(event) => choose(event.target.value, klass)}
            >
              {rows.map((row) => (
                <MenuItem key={row.key} value={row.key}>
                  {row.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        ) : null}
        {rows[0].key === "staff" ? (
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Head"
              helperText="Every head rolls alike, so it does not change the score"
              value={head}
              onChange={(event) => setHead(event.target.value)}
            >
              {ITEMS.staffHeads.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        ) : null}
        <Grid size={{ xs: 12, sm: rows[0].key === "interceptor" ? 12 : 4 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Class"
            value={klass}
            onChange={(event) => choose(type, Number(event.target.value))}
          >
            {ITEMS.classes.map((name, at) => (
              <MenuItem key={name} value={at}>
                {name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
      <Stack spacing={1}>
        <Typography variant="subtitle2">Supercharged slots</Typography>
        <SlotGrid
          size={ship ? SHIP_GRID : TOOL_GRID}
          cells={cells}
          onChange={setCells}
        />
      </Stack>
      <Grid container spacing={2}>
        {open.map((name) => {
          const limit = limitOf(held, ship, name) as Limit;
          return (
            <Grid key={name} size={{ xs: 12, sm: 4 }}>
              <NumberField
                label={FIELD_NAMES[name]}
                helper={
                  !ship && name === "damage"
                    ? "As the game shows it"
                    : `As the game shows it, ${limit[0].toFixed(1).replace(/\.0$/, "")} to ${limit[1].toFixed(1).replace(/\.0$/, "")}`
                }
                limit={limit}
                value={fields[name] ?? ""}
                onChange={(value) =>
                  setFields((now) => ({ ...now, [name]: value }))
                }
              />
            </Grid>
          );
        })}
      </Grid>
      <Box>
        <Button
          color="inherit"
          onClick={() => {
            setCells([]);
            setFields({});
          }}
        >
          Clear
        </Button>
      </Box>
      <Verdict luck={luck} klass={klass} />
    </Stack>
  );
}

const staffs = (row: ItemRow) => row.key === "staff";
const interceptors = (row: ItemRow) => row.key === "interceptor";

const TABS = [
  {
    slug: "multitool",
    label: "Multitool",
    ship: false,
    rows: ITEMS.tools.filter((row) => !staffs(row)),
  },
  {
    slug: "staff",
    label: "Staff",
    ship: false,
    rows: ITEMS.tools.filter(staffs),
  },
  {
    slug: "ship",
    label: "Ship",
    ship: true,
    rows: ITEMS.ships.filter((row) => !interceptors(row)),
  },
  {
    slug: "interceptor",
    label: "Interceptor",
    ship: true,
    rows: ITEMS.ships.filter(interceptors),
  },
];

// Every form stays mounted, so a tab keeps what was entered in it. The tab goes in
// the address, so it can be linked.
function Calculator(props: { first: number }) {
  const [tab, setTab] = useState(props.first);
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
        aria-label="Kind of item"
      >
        {TABS.map((row) => (
          <Tab key={row.slug} label={row.label} />
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
