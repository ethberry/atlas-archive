-- Planets are stored in bodies. The catalogue kind is planet.

create table public.bodies (
  id uuid primary key references public.assets (id) on delete cascade,
  glyphs text,
  phrase text not null default '',
  biome smallint,
  resources text[] not null default '{}',
  sentinels text,
  ancient_bones boolean,
  salvageable_scrap boolean,
  dissonance boolean not null default false,
  activated_stellar boolean
);

create index bodies_biome_idx on public.bodies (biome);

alter table public.bodies enable row level security;

create policy bodies_select
  on public.bodies
  for select
  to anon, authenticated
  using (public.can_read_asset(id));

grant select on public.bodies to anon, authenticated;
