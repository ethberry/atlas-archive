create table public.galaxies (
  id uuid primary key references public.assets (id) on delete cascade
);

alter table public.galaxies enable row level security;

create policy galaxies_select
  on public.galaxies
  for select
  to anon, authenticated
  using (public.can_read_asset(id));

grant select on public.galaxies to anon, authenticated;
