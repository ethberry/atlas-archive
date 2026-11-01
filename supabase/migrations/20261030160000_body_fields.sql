-- A planet keeps what its card shows: the biome type, not the card's biome
-- line or its phrase key; the planet index is not shown either.

alter table public.bodies
  drop column planet_index,
  drop column phrase,
  drop column localized_biome;
