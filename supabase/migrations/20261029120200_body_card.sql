-- planet_index is the address field, from 1. localized_biome is the biome
-- line of the card, including the class word.

alter table public.bodies
  add column planet_index smallint,
  add column localized_biome text,
  add column water boolean,
  add column gas_giant boolean;
