-- Verified items: a tool, a ship, or a creature checked in the game. The
-- owner sets the flag by hand in the database. The seeds are not shown and
-- are generated again when needed, so they are not stored.

alter table public.tools
  drop column pool,
  drop column weapon_seed,
  drop column class_seed,
  add column verified boolean not null default false;

alter table public.ships
  drop column layout_seed,
  drop column model_seed,
  add column verified boolean not null default false;

alter table public.creatures
  add column verified boolean not null default false;
