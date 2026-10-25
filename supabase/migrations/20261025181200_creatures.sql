create table public.creatures (
  id uuid primary key references public.assets (id) on delete cascade,
  helpfulness text,
  aggression text,
  independence text,
  constraint creatures_helpfulness_check check (
    helpfulness is null or helpfulness in ('C', 'B', 'A', 'S')
  ),
  constraint creatures_aggression_check check (
    aggression is null or aggression in ('C', 'B', 'A', 'S')
  ),
  constraint creatures_independence_check check (
    independence is null or independence in ('C', 'B', 'A', 'S')
  )
);

alter table public.creatures enable row level security;

create policy creatures_select
  on public.creatures
  for select
  to anon, authenticated
  using (public.can_read_asset(id));

grant select on public.creatures to anon, authenticated;
