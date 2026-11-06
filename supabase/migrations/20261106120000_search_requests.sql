-- A player asks the site to search for the ship built in a builder (the owner,
-- 2026-11-06). The search does not exist yet: the table counts who wants it and for
-- which form, the unique users first. The form is the builder's own values: `choice`,
-- the group id to option id of the part graph, and `paint`, its colour scheme and
-- cells. A player asking the same form twice counts once.
create table public.search_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  choice jsonb not null,
  paint jsonb not null,
  -- A hash of the form, so that "the same form" is a unique key of a small size
  -- (a jsonb of the Interceptor's 80 groups is too long for an index entry).
  form_key text generated always as (md5(choice::text || paint::text)) stored,
  created_at timestamptz not null default now(),
  constraint search_requests_kind_check check (
    kind in (
      'interceptor',
      'capital-freighter',
      'living-ship',
      'living-frigate',
      'regular-freighter'
    )
  ),
  constraint search_requests_choice_check check (jsonb_typeof(choice) = 'object'),
  constraint search_requests_one_form unique (user_id, kind, form_key)
);

create index search_requests_kind_idx on public.search_requests (kind);

alter table public.search_requests enable row level security;

-- A player reads only their own requests; the owner counts all of them in the
-- dashboard, which bypasses these policies.
create policy search_requests_select
  on public.search_requests
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy search_requests_insert
  on public.search_requests
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

grant select, insert on public.search_requests to authenticated;
