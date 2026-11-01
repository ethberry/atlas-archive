-- Seeds are sixteen hex digits. weapon_seed sets the body, the name, and the
-- cells an upgrade adds; class_seed sets the class and the natural cells.
-- supercharged is the four cells at class S; natural_supercharged is the
-- cells of the class found.

alter table public.tools
  add column pool text,
  add column weapon_seed text,
  add column class_seed text,
  add column natural_supercharged jsonb not null default '[]'::jsonb,
  add constraint tools_pool_check check (
    pool is null or pool in ('standard', 'exotic', 'sentinel', 'atlas', 'settlement')
  );
