-- One row per buyer. A grant on an ancestor is enough for every descendant.

create table public.asset_grants (
  asset_id uuid not null references public.assets (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  primary key (asset_id, user_id)
);

create index asset_grants_user_id_idx on public.asset_grants (user_id);

alter table public.asset_grants enable row level security;

create policy grants_select
  on public.asset_grants
  for select
  to authenticated
  using (user_id = (select auth.uid()));

grant select on public.asset_grants to authenticated;
