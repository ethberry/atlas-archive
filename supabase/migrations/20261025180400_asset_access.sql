-- Security definer so entity policies can check visibility without recursing into assets RLS.

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

revoke all on function public.can_read_asset(uuid) from public;
grant execute on function public.can_read_asset(uuid) to anon, authenticated;

create policy assets_granted
  on public.assets
  for select
  to authenticated
  using (public.can_read_asset(id));
