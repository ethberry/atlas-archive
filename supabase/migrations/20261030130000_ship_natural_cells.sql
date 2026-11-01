-- The supercharged cells a wreck has at the class it is found with.
-- supercharged holds the four cells at S; for a wreck found at S both are
-- the same, and natural_supercharged may stay empty.

alter table public.ships
  add column natural_supercharged jsonb;
