-- Buildings are stored in pois. The catalogue kind is building.

create table public.pois (
  id uuid primary key references public.assets (id) on delete cascade,
  building_type text not null,
  face smallint,
  i integer,
  j integer
);

alter table public.pois enable row level security;

create policy pois_select
  on public.pois
  for select
  to anon, authenticated
  using (public.can_read_asset(id));

grant select on public.pois to anon, authenticated;
