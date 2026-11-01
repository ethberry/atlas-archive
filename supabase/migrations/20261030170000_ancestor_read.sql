-- A planet lists its items at any depth through asset_ancestors, so the
-- site reads the rows of records it can read.

create policy asset_ancestors_select
  on public.asset_ancestors
  for select
  to anon, authenticated
  using (public.can_read_asset(asset_id));
