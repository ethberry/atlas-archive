create table public.ships (
  id uuid primary key references public.assets (id) on delete cascade,
  hull text,
  class text,
  supercharged jsonb not null default '[]'::jsonb
);

alter table public.ships enable row level security;

create policy ships_select
  on public.ships
  for select
  to anon, authenticated
  using (public.can_read_asset(id));

grant select on public.ships to anon, authenticated;
