-- Catalogue identity is a uuid. The game path stays on assets.locator.
-- A grant on an ancestor covers every descendant.

create extension if not exists pg_trgm;

alter table public.bodies rename to bodies_legacy;
alter table public.systems rename to systems_legacy;

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  parent_id uuid references public.assets (id) on delete cascade,
  name text not null,
  locator text,
  visibility text not null default 'public',
  like_count integer not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint assets_kind_check check (
    kind in ('galaxy', 'system', 'planet', 'building', 'ship', 'tool', 'animal')
  ),
  constraint assets_visibility_check check (visibility in ('public', 'private')),
  constraint assets_like_count_check check (like_count >= 0)
);

create table public.asset_ancestors (
  asset_id uuid not null references public.assets (id) on delete cascade,
  ancestor_id uuid not null references public.assets (id) on delete cascade,
  primary key (asset_id, ancestor_id)
);

create index asset_ancestors_ancestor_id_idx on public.asset_ancestors (ancestor_id);

create table public.asset_grants (
  asset_id uuid not null references public.assets (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  primary key (asset_id, user_id)
);

create index asset_grants_user_id_idx on public.asset_grants (user_id);

create table public.likes (
  asset_id uuid not null references public.assets (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (asset_id, user_id)
);

create table public.galaxies (
  id uuid primary key references public.assets (id) on delete cascade
);

create table public.systems (
  id uuid primary key references public.assets (id) on delete cascade,
  address text not null unique,
  star text not null,
  population text,
  station text not null,
  economy text,
  wealth text,
  conflict text,
  water boolean,
  dissonance boolean,
  gas_giant boolean,
  light_years integer not null
);

create table public.bodies (
  id uuid primary key references public.assets (id) on delete cascade,
  glyphs text,
  phrase text not null default '',
  biome smallint,
  resources text[] not null default '{}',
  sentinels text,
  ancient_bones boolean,
  salvageable_scrap boolean,
  dissonance boolean not null default false,
  activated_stellar boolean
);

create table public.pois (
  id uuid primary key references public.assets (id) on delete cascade,
  building_type text not null,
  face smallint,
  i integer,
  j integer
);

create table public.ships (
  id uuid primary key references public.assets (id) on delete cascade,
  hull text,
  class text,
  supercharged jsonb not null default '[]'::jsonb
);

create table public.tools (
  id uuid primary key references public.assets (id) on delete cascade,
  body text,
  class text,
  supercharged jsonb not null default '[]'::jsonb
);

create table public.fauna (
  id uuid primary key references public.assets (id) on delete cascade
);

create index assets_parent_id_idx on public.assets (parent_id);
create index assets_name_trgm_idx on public.assets using gin (name gin_trgm_ops);
create index assets_kind_created_idx on public.assets (kind, created_at desc);
create index assets_feed_likes_idx on public.assets (like_count desc, created_at desc)
  where kind in ('planet', 'ship', 'tool', 'animal');
create index assets_feed_recent_idx on public.assets (created_at desc)
  where kind in ('planet', 'ship', 'tool', 'animal');
create index systems_star_idx on public.systems (star);
create index systems_station_idx on public.systems (station);
create index bodies_biome_idx on public.bodies (biome);

create or replace function public.rebuild_ancestors(target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  parent uuid;
begin
  select parent_id into parent from public.assets where id = target;
  delete from public.asset_ancestors where asset_id = target;
  if parent is not null then
    insert into public.asset_ancestors (asset_id, ancestor_id)
    select target, ancestor_id
    from public.asset_ancestors
    where asset_id = parent;
  end if;
  insert into public.asset_ancestors (asset_id, ancestor_id)
  values (target, target)
  on conflict do nothing;
end;
$$;

create or replace function public.sync_asset_ancestors()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  child uuid;
begin
  perform public.rebuild_ancestors(new.id);
  if tg_op = 'UPDATE' and new.parent_id is distinct from old.parent_id then
    for child in
      with recursive tree as (
        select id from public.assets where parent_id = new.id
        union all
        select child_asset.id
        from public.assets as child_asset
        join tree on child_asset.parent_id = tree.id
      )
      select id from tree
    loop
      perform public.rebuild_ancestors(child);
    end loop;
  end if;
  return new;
end;
$$;

create trigger assets_sync_ancestors
  after insert or update of parent_id on public.assets
  for each row
  execute function public.sync_asset_ancestors();

create or replace function public.bump_like_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  asset_kind text;
begin
  if tg_op = 'INSERT' then
    select kind into asset_kind from public.assets where id = new.asset_id;
    if asset_kind in ('galaxy', 'system') then
      raise exception 'This asset cannot be liked';
    end if;
    update public.assets
      set like_count = like_count + 1
      where id = new.asset_id;
    return new;
  end if;
  update public.assets
    set like_count = greatest(like_count - 1, 0)
    where id = old.asset_id;
  return old;
end;
$$;

create trigger likes_bump_count
  after insert or delete on public.likes
  for each row
  execute function public.bump_like_count();

create or replace function public.can_read_asset(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.assets as asset
    where asset.id = target
      and (
        asset.visibility = 'public'
        or asset.created_by = (select auth.uid())
        or exists (
          select 1
          from public.asset_ancestors as link
          join public.asset_grants as access_grant on access_grant.asset_id = link.ancestor_id
          where link.asset_id = asset.id
            and access_grant.user_id = (select auth.uid())
        )
      )
  );
$$;

revoke all on function public.rebuild_ancestors(uuid) from public;
revoke all on function public.sync_asset_ancestors() from public;
revoke all on function public.bump_like_count() from public;
revoke all on function public.can_read_asset(uuid) from public;
grant execute on function public.can_read_asset(uuid) to anon, authenticated;

alter table public.assets enable row level security;
alter table public.asset_ancestors enable row level security;
alter table public.asset_grants enable row level security;
alter table public.likes enable row level security;
alter table public.galaxies enable row level security;
alter table public.systems enable row level security;
alter table public.bodies enable row level security;
alter table public.pois enable row level security;
alter table public.ships enable row level security;
alter table public.tools enable row level security;
alter table public.fauna enable row level security;

create policy assets_public
  on public.assets
  for select
  to anon, authenticated
  using (visibility = 'public');

create policy assets_granted
  on public.assets
  for select
  to authenticated
  using (public.can_read_asset(id));

create policy galaxies_select
  on public.galaxies
  for select
  to anon, authenticated
  using (public.can_read_asset(id));

create policy systems_select
  on public.systems
  for select
  to anon, authenticated
  using (public.can_read_asset(id));

create policy bodies_select
  on public.bodies
  for select
  to anon, authenticated
  using (public.can_read_asset(id));

create policy pois_select
  on public.pois
  for select
  to anon, authenticated
  using (public.can_read_asset(id));

create policy ships_select
  on public.ships
  for select
  to anon, authenticated
  using (public.can_read_asset(id));

create policy tools_select
  on public.tools
  for select
  to anon, authenticated
  using (public.can_read_asset(id));

create policy fauna_select
  on public.fauna
  for select
  to anon, authenticated
  using (public.can_read_asset(id));

create policy grants_select
  on public.asset_grants
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy likes_select
  on public.likes
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy likes_insert
  on public.likes
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and public.can_read_asset(asset_id)
    and exists (
      select 1
      from public.assets as asset
      where asset.id = asset_id
        and asset.kind not in ('galaxy', 'system')
    )
  );

create policy likes_delete
  on public.likes
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

grant select on public.assets, public.galaxies, public.systems, public.bodies,
  public.pois, public.ships, public.tools, public.fauna to anon, authenticated;
grant select on public.asset_grants to authenticated;
grant select, insert, delete on public.likes to authenticated;

insert into public.assets (id, kind, name, locator)
select gen_random_uuid(), 'system', name, address
from public.systems_legacy;

insert into public.systems (
  id, address, star, population, station, economy, wealth, conflict,
  water, dissonance, gas_giant, light_years
)
select
  asset.id,
  legacy.address,
  legacy.star,
  legacy.population,
  legacy.station,
  case when jsonb_typeof(legacy.card -> 'economy') = 'string' then legacy.card ->> 'economy' else null end,
  case when jsonb_typeof(legacy.card -> 'wealth') = 'string' then legacy.card ->> 'wealth' else null end,
  case when jsonb_typeof(legacy.card -> 'conflict') = 'string' then legacy.card ->> 'conflict' else null end,
  case when jsonb_typeof(legacy.card -> 'water') = 'boolean' then (legacy.card ->> 'water')::boolean else null end,
  case when jsonb_typeof(legacy.card -> 'dissonance') = 'boolean' then (legacy.card ->> 'dissonance')::boolean else null end,
  case when jsonb_typeof(legacy.card -> 'gas_giant') = 'boolean' then (legacy.card ->> 'gas_giant')::boolean else null end,
  legacy.light_years
from public.systems_legacy as legacy
join public.assets as asset on asset.locator = legacy.address and asset.kind = 'system';

create temporary table planet_map (
  asset_id uuid not null,
  address text not null,
  body_index integer not null,
  primary key (address, body_index)
);

insert into planet_map (asset_id, address, body_index)
select gen_random_uuid(), address, body_index
from public.bodies_legacy;

insert into public.assets (id, kind, parent_id, name, locator)
select
  mapped.asset_id,
  'planet',
  parent.id,
  legacy.name,
  legacy.glyphs
from public.bodies_legacy as legacy
join planet_map as mapped
  on mapped.address = legacy.address
  and mapped.body_index = legacy.body_index
join public.assets as parent
  on parent.locator = legacy.address
  and parent.kind = 'system';

insert into public.bodies (
  id, glyphs, phrase, biome, resources, sentinels,
  ancient_bones, salvageable_scrap, dissonance, activated_stellar
)
select
  mapped.asset_id,
  legacy.glyphs,
  legacy.phrase,
  legacy.biome,
  coalesce(
    (
      select array_agg(item)
      from jsonb_array_elements_text(
        case
          when jsonb_typeof(legacy.card -> 'resources') = 'array' then legacy.card -> 'resources'
          else '[]'::jsonb
        end
      ) as item
    ),
    '{}'::text[]
  ),
  case when jsonb_typeof(legacy.card -> 'sentinels') = 'string' then legacy.card ->> 'sentinels' else null end,
  case when jsonb_typeof(legacy.card -> 'ancient_bones') = 'boolean' then (legacy.card ->> 'ancient_bones')::boolean else null end,
  case when jsonb_typeof(legacy.card -> 'salvageable_scrap') = 'boolean' then (legacy.card ->> 'salvageable_scrap')::boolean else null end,
  case
    when jsonb_typeof(legacy.card -> 'dissonance') = 'boolean' then (legacy.card ->> 'dissonance')::boolean
    else false
  end,
  case when jsonb_typeof(legacy.card -> 'activated_stellar') = 'boolean' then (legacy.card ->> 'activated_stellar')::boolean else null end
from public.bodies_legacy as legacy
join planet_map as mapped
  on mapped.address = legacy.address
  and mapped.body_index = legacy.body_index;

drop table public.bodies_legacy;
drop table public.systems_legacy;
