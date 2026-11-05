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
