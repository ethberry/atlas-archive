<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Atlas Archive

The site of the finds of crimson-orb, live at https://atlas-archive-tau.vercel.app/. How to work and write code here is
`.claude/rules/`.

## Parts

| Part | What it is |
|---|---|
| `app` | Next.js routes: the catalog (`[kind]`), `guides`, the tools, `about`, the legal pages, `api` |
| `components` | `archive` (screens and widgets), `legal`, `providers` (theme, intl, auth) |
| `lib` | `archive` (queries, statistics, features, guides), `db` (Supabase client and generated types), `i18n` (messages) |
| `content` | Markdown of every long text, one folder a locale |
| `public` | pictures: ship part layers, renders, module icons, fonts |
| `supabase` | the schema: `migrations`, `config.toml` |
| `docs` | `seo.md`: the semantic core, the link map, the review before a release |
| `.github/workflows` | `production.yml`: a merge to `main` deploys and migrates production |

## Run

```bash
npm run dev                    # the site on localhost:3000
npx supabase start             # the local database, Docker stack supabase_*_atlas-archive
npx supabase migration up --local
npm run supabase:generate      # types from the local database
npm run lint
npm run build
```
