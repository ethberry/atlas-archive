-- Screenshots players add to a ship, a tool, or a creature: one per player
-- per item. A file sits in the private bucket and is shown only after the
-- owner sets is_verified by hand; the uploader cannot set it.

create table public.asset_images (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  object_path text not null,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  unique (asset_id, user_id)
);

create index asset_images_asset_id_idx on public.asset_images (asset_id, created_at);
create index asset_images_user_id_idx on public.asset_images (user_id);

alter table public.asset_images enable row level security;

create policy asset_images_select
  on public.asset_images
  for select
  to anon, authenticated
  using (
    (is_verified and public.can_read_asset(asset_id))
    or user_id = (select auth.uid())
  );

create policy asset_images_insert
  on public.asset_images
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and is_verified = false
    and public.can_read_asset(asset_id)
    and object_path like asset_id::text || '/' || user_id::text || '/%'
    and exists (
      select 1
      from public.assets as asset
      where asset.id = asset_id
        and asset.kind in ('ship', 'tool', 'creature')
    )
  );

-- Replacing a screenshot is a delete and an insert, so it goes back to review.
create policy asset_images_delete
  on public.asset_images
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

grant select on public.asset_images to anon, authenticated;
grant insert, delete on public.asset_images to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'screenshots',
  'screenshots',
  false,
  1048576,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy screenshots_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'screenshots'
    and (storage.foldername(name))[2] = (select auth.uid())::text
  );

create policy screenshots_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'screenshots'
    and (storage.foldername(name))[2] = (select auth.uid())::text
  );

create policy screenshots_select
  on storage.objects
  for select
  to anon, authenticated
  using (
    bucket_id = 'screenshots'
    and (
      (storage.foldername(name))[2] = (select auth.uid())::text
      or exists (
        select 1
        from public.asset_images as image
        where image.object_path = name
          and image.is_verified
          and public.can_read_asset(image.asset_id)
      )
    )
  );
