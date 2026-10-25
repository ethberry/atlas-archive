create table public.systems (
  address text primary key,
  name text not null,
  star text not null,
  population text,
  station text not null,
  light_years integer not null,
  card jsonb not null
);

create table public.bodies (
  address text not null references public.systems (address),
  body_index integer not null,
  glyphs text not null,
  name text not null,
  phrase text not null,
  biome smallint not null,
  card jsonb not null,
  unique (address, body_index)
);

alter table public.systems enable row level security;
alter table public.bodies enable row level security;

create policy "systems are readable"
  on public.systems
  for select
  to anon, authenticated
  using (true);

create policy "bodies are readable"
  on public.bodies
  for select
  to anon, authenticated
  using (true);
