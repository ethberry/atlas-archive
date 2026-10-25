create table public.likes (
  asset_id uuid not null references public.assets (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (asset_id, user_id)
);

create index likes_user_id_idx on public.likes (user_id);

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

revoke all on function public.bump_like_count() from public;

alter table public.likes enable row level security;

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

grant select, insert, delete on public.likes to authenticated;
