---
paths:
  - "app/**"
  - "components/**"
  - "lib/**"
  - "next.config.ts"
---

# Site code

The stack is Next.js (App Router), React, Material UI, React Hook Form, and react-intl, each used the way its own
documentation recommends. This Next.js is newer than most examples: read the guide in `node_modules/next/dist/docs/`
before using an API (`01-app/01-getting-started` covers server and client components, data, caching, metadata).

## Principles

- KISS, DRY, YAGNI: the simplest code that does the asked thing, one place for one rule, nothing built for a case that
  does not exist yet. Delete code that nothing uses.
- Name every constant: a number with a meaning (a game value, a threshold, a tolerance) gets a name and a comment on
  where it comes from (a game file, a doc of crimson-orb, or "our own choice"). Layout numbers (spacing, sizes) are exempt.
- The site must stay fast. A page is a server component and static where it can be; `"use client"` goes on the smallest
  component that needs a state, an effect, or a browser API. Data is read on the server. A large client library loads
  lazily where only one page needs it.

## Components

- Material UI for every control and layout; theme tokens over literal colours.
- Every form holds its values in React Hook Form (`useForm`, `Controller`, `useWatch`): the catalog filters, the
  builders and finders, the luck calculator, and every new form. Plain `useState` is for what is not a value of a form:
  the open tab or group, a loaded picture, a search result.
- Localization on two levels (the owner, 2026-11-05): every label, button, table head, row label, and short string
  through react-intl and `lib/i18n/<locale>.json`; every long text through Markdown in `content/<locale>/`. A page is
  converted when it is next changed, with the keys `store/src/pages/` writes for it in place of English words. Never
  convert everything at once.

## Data

- Supabase types (`lib/db/supabase.types.ts`) are generated with `npm run supabase:generate`, then formatted with
  prettier, never edited by hand.
- Paths of guides are built with `guidePath` and `groupPath`, never typed.
- Statistics numbers print only through `lib/archive/statistics-format.ts`. A galaxy in a table goes through
  `GalaxyLink`; a new galaxy on a page needs a line in `lib/archive/galaxies.ts`.
- Every table of numbers gets a chart, in `lib/archive/statistics-charts.ts`, on the server, from `rawTableOf`, drawn by
  `ChartBlock.tsx` with Chart first and the table kept in the HTML. Charts use `@mui/x-charts`, free version. Colours
  live in `lib/archive/chart-colors.ts`, one per thing, on every chart. A chart draws counts on one scale, never two
  shares of different wholes side by side.
- The code keeps the old names (`statistics.json`, `content/en/statistics/`, `StatisticsScreen`); only what a visitor
  reads changed.
- A canvas never reads a weight from alpha: a browser zeroes the colour of a pixel of alpha 0.
