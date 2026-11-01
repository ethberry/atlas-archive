-- The number of likes is counted, not stored. like_count(asset) reads like a
-- column in PostgREST: it can be selected and ordered by. It counts every
-- user's likes, which the caller cannot read, so it runs as definer.

drop trigger likes_bump_count on public.likes;
drop function public.bump_like_count();
drop index if exists public.assets_feed_likes_idx;

alter table public.assets
  drop constraint assets_like_count_check,
  drop column like_count;

create or replace function public.like_count(asset public.assets)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer from public.likes where asset_id = asset.id;
$$;

grant execute on function public.like_count(public.assets) to anon, authenticated;
