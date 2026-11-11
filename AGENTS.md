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
| `app` | Next.js routes: the catalog (`[kind]`), `guides`, `quests`, the tools, `about`, the legal pages, `api` |
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

## Rules

- No one-off scripts in any language or disguise: no `node -e`, `node -p`, `python -c`, `ruby -e`, `perl -e` scripts,
  `awk` programs, a heredoc fed to any interpreter, a script file written to a scratch folder and run once, or a chain
  of shell tools that rebuilds what a command already does. Run the existing `npm run …` scripts and checks; a plain `grep` or `rg` search
  of the text is fine. Do not add scripts to `package.json` or new checks unless the owner asks for them (the owner,
  2026-11-07: `package.json` is not to swell with scripts). A one-line edit of a file with `perl -pi` or `sed -i` is an edit, not a script,
  and stays allowed. Why (the owner): a one-off script is written in full every time, costs many times the tokens of a
  command line, is debugged again each session, and leaves nothing behind; written in the moment and untested, it can
  also break what it touches. A command added once is paid for once and gets tested by every run.
