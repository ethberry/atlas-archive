-- The space points of a system (Cosmos, 7.0), drawn from its address: the
-- shown hulks, asteroid belts, and ice fields, and whether a Relic Gate is
-- among them. The rows are filled by 20261113120001_system_space_poi_rows.sql.
alter table public.systems
  add column hulks smallint not null default 0 check (hulks >= 0),
  add column asteroid_belts smallint not null default 0 check (asteroid_belts >= 0),
  add column ice_fields smallint not null default 0 check (ice_fields >= 0),
  add column relic_gate boolean not null default false;
