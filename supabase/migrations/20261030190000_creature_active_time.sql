-- When a creature is about: day, mostly_day, any, mostly_night, or night.

alter table public.creatures
  add column active_time text;
