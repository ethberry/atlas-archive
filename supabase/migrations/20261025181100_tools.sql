create table public.tools (
  id uuid primary key references public.assets (id) on delete cascade,
  body text,
  class text,
  supercharged jsonb not null default '[]'::jsonb
);

alter table public.tools enable row level security;

create policy tools_select
  on public.tools
  for select
  to anon, authenticated
  using (public.can_read_asset(id));

grant select on public.tools to anon, authenticated;
