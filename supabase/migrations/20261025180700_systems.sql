create table public.systems (
  id uuid primary key references public.assets (id) on delete cascade,
  address text not null unique,
  star text not null,
  population text,
  station text not null,
  economy text,
  wealth text,
  conflict text,
  water boolean,
  dissonance boolean,
  gas_giant boolean,
  light_years integer not null
);

create index systems_star_idx on public.systems (star);
create index systems_station_idx on public.systems (station);

alter table public.systems enable row level security;

create policy systems_select
  on public.systems
  for select
  to anon, authenticated
  using (public.can_read_asset(id));

grant select on public.systems to anon, authenticated;
