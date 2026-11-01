-- The three pet-battle grades and the damage affinity.

alter table public.creatures
  drop constraint creatures_helpfulness_check,
  drop constraint creatures_aggression_check,
  drop constraint creatures_independence_check;

alter table public.creatures rename column helpfulness to combat;
alter table public.creatures rename column aggression to agility;
alter table public.creatures rename column independence to health;

alter table public.creatures
  add column affinity text,
  add column adoptable boolean not null default true,
  add constraint creatures_combat_check check (combat is null or combat in ('C', 'B', 'A', 'S')),
  add constraint creatures_agility_check check (agility is null or agility in ('C', 'B', 'A', 'S')),
  add constraint creatures_health_check check (health is null or health in ('C', 'B', 'A', 'S'));
