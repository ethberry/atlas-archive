-- The serializer class is Creature. The three visor grades are
-- cGcCreaturePetTraits: Helpfulness, Aggression, Independence.

alter table public.assets drop constraint assets_kind_check;

update public.assets
set kind = 'creature'
where kind = 'animal';

alter table public.assets
  add constraint assets_kind_check check (
    kind in ('galaxy', 'system', 'planet', 'building', 'ship', 'tool', 'creature')
  );

drop index if exists public.assets_feed_likes_idx;
drop index if exists public.assets_feed_recent_idx;

create index assets_feed_likes_idx on public.assets (like_count desc, created_at desc)
  where kind in ('planet', 'ship', 'tool', 'creature');

create index assets_feed_recent_idx on public.assets (created_at desc)
  where kind in ('planet', 'ship', 'tool', 'creature');

alter table public.fauna rename to creatures;

alter table public.creatures rename constraint fauna_pkey to creatures_pkey;
alter table public.creatures rename constraint fauna_id_fkey to creatures_id_fkey;

drop policy if exists fauna_select on public.creatures;

create policy creatures_select
  on public.creatures
  for select
  to anon, authenticated
  using (public.can_read_asset(id));

grant select on public.creatures to anon, authenticated;

alter table public.creatures
  add column helpfulness text,
  add column aggression text,
  add column independence text;

alter table public.creatures
  add constraint creatures_helpfulness_check check (
    helpfulness is null or helpfulness in ('C', 'B', 'A', 'S')
  ),
  add constraint creatures_aggression_check check (
    aggression is null or aggression in ('C', 'B', 'A', 'S')
  ),
  add constraint creatures_independence_check check (
    independence is null or independence in ('C', 'B', 'A', 'S')
  );
