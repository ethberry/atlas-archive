-- The base stats of a tool and a ship as found: the percents the game draws and
-- stores on the inventory, before anything installed. A ship's are what its
-- wreck shows; a claimed ship can read higher. Null where the body or hull has
-- no range for the stat at its class, and on a row written before these columns.
alter table public.tools
  add column base_damage real,
  add column base_mining real,
  add column base_scanner real;

alter table public.ships
  add column base_damage real,
  add column base_shield real,
  add column base_hyperdrive real,
  add column base_agile real;
