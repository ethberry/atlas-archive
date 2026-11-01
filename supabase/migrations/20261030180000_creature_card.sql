-- Only adoptable creatures are stored, so the flag says nothing. A creature
-- keeps where to look for it: ground, air, water, or cave.

alter table public.creatures
  drop column adoptable,
  add column habitat text;
