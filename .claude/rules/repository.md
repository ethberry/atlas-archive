# Repository, database, release

- Work and commit on `dev`. `main` holds releases: a merge to `main` deploys production
  (https://atlas-archive-tau.vercel.app/) and runs the migrations through CI, so it happens only on the owner's word.
- No command touches the remote database directly, not even a read: no `supabase db query --linked`,
  `db reset --linked`, `migration list --linked`, or `link`. The remote changes only through a migration, the owner's
  commit, and CI. The local database (the Docker stack `supabase_*_atlas-archive`) is free to use; production is checked
  over HTTP.
- A schema change is a new migration in `supabase/migrations`, applied locally with `npx supabase migration up --local`,
  then the types are generated again. A migration that ran on production stays as it is.
- The database stays small: it holds only what the site shows. Nothing the generator can give again (seeds, derived
  values) is stored, a short list of values is a checked enum, and a count that a query can give is not kept.
- `parts.xml` stays out of commits (CC BY-NC-SA, in `.gitignore`).

## Who owns what

This repository is the No Man's Sky app of Seed Archive (seedarchive.gg), one zone of a Next.js Multi-Zones portal:
each game has its own app with `basePath` equal to its slug, and a small portal app will route `/<slug>/*` to each
(the owner, 2026-11-14). It is being renamed from `atlas-archive` to `no-mans-sky-site`.

- **The No Man's Sky session owns this repository**: pages, texts, data, pictures, components, and the migrations of its
  schema.
- **The coordinating session owns what the games share**: the domain and DNS, the Vercel project and its environment
  variables, the redirects of old addresses, and the zone contract — `basePath` stays `/no-mans-sky` (`lib/site.ts`),
  the domain and sign-in stay shared. A change to any of these goes through the coordinator.
- While the move to the domain and the renames are in progress, the coordinator also sets the order of merges into
  `dev` and of releases.

## Each game's tables

The site is Seed Archive: one Supabase project and one database for every game it covers (the owner, 2026-11-14).

- **A game's tables live in its own Postgres schema, named by the game's short slug: `nms` for No Man's Sky**, and a
  new game gets its own (`valheim`, `oni`, …). Never a prefix on the table name: a schema is the namespace Postgres
  already has, and it works on the free plan like any other.
- Tables of the site itself — likes, search requests, picture grants, anything not owned by one game — stay in
  `public`. Which tables are shared is decided per table when the second game arrives, not before.
- **Today every table is still in `public`.** Moving No Man's Sky's tables into `nms` is a release of its own, after
  the move to seedarchive.gg and never bundled with another change, so a failure has one cause.
- How a game's schema is made:
  1. a migration: `create schema nms;`, then `alter table public.<t> set schema nms;` per table — the data, indexes,
     constraints and policies move with the table; functions that name `public.<t>` are recreated;
  2. grants in the same migration: `grant usage on schema nms to anon, authenticated;` and the table grants the
     policies need;
  3. the schema exposed to the API: `schemas` under `[api]` in `supabase/config.toml` locally; on production the
     **owner** adds it in the dashboard (Settings → Data API → Exposed schemas), since no command here touches the
     remote;
  4. the code reads `supabase.schema("nms").from("<t>")`; the types are generated for every schema in use;
  5. every writer outside this repository names the schema too — crimson-orb's `store` writes `public.<t>` today.
- A session working on one game creates and changes tables only in that game's schema, through migrations in this
  repository.
