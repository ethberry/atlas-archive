-- An item and the points that give it. A wreck and a terminal give one item
-- each. Every sentinel pillar of a system gives the tool of the planet where
-- the save was loaded, so one tool links to every pillar of the system, once
-- per load place. entry_planet is that planet; entry_station marks a save
-- loaded on the space station. Both are empty when the load place does not
-- matter.

create table public.poi_items (
  poi_id uuid not null references public.pois (id) on delete cascade,
  item_id uuid not null references public.assets (id) on delete cascade,
  entry_planet uuid references public.bodies (id) on delete cascade,
  entry_station boolean not null default false,
  primary key (poi_id, item_id),
  constraint poi_items_entry_check check (not (entry_station and entry_planet is not null))
);

create index poi_items_item_id_idx on public.poi_items (item_id);

alter table public.poi_items enable row level security;

create policy poi_items_select
  on public.poi_items
  for select
  to anon, authenticated
  using (public.can_read_asset(poi_id) and public.can_read_asset(item_id));

grant select on public.poi_items to anon, authenticated;
