-- Shared catalogue row. Kind-specific columns live on the entity tables.

create extension if not exists pg_trgm;

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  parent_id uuid references public.assets (id) on delete cascade,
  name text not null,
  locator text,
  visibility text not null default 'public',
  like_count integer not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint assets_kind_check check (
    kind in ('galaxy', 'system', 'planet', 'building', 'ship', 'tool', 'creature')
  ),
  constraint assets_visibility_check check (visibility in ('public', 'private')),
  constraint assets_like_count_check check (like_count >= 0)
);

create index assets_parent_id_idx on public.assets (parent_id);
create index assets_name_trgm_idx on public.assets using gin (name gin_trgm_ops);
create index assets_kind_created_idx on public.assets (kind, created_at desc);
create index assets_feed_likes_idx on public.assets (like_count desc, created_at desc)
  where kind in ('planet', 'ship', 'tool', 'creature');
create index assets_feed_recent_idx on public.assets (created_at desc)
  where kind in ('planet', 'ship', 'tool', 'creature');

alter table public.assets enable row level security;

create policy assets_public
  on public.assets
  for select
  to anon, authenticated
  using (visibility = 'public');

grant select on public.assets to anon, authenticated;
