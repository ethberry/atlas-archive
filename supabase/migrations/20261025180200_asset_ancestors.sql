-- Self plus every ancestor, so a grant on a parent covers its descendants.

create table public.asset_ancestors (
  asset_id uuid not null references public.assets (id) on delete cascade,
  ancestor_id uuid not null references public.assets (id) on delete cascade,
  primary key (asset_id, ancestor_id)
);

create index asset_ancestors_ancestor_id_idx on public.asset_ancestors (ancestor_id);

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

revoke all on function public.rebuild_ancestors(uuid) from public;
revoke all on function public.sync_asset_ancestors() from public;

alter table public.asset_ancestors enable row level security;
