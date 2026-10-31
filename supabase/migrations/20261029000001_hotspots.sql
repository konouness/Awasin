create table public.hotspots (
  id smallint primary key default 1 check (id = 1),
  points jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.hotspots enable row level security;
grant all on public.hotspots to service_role;
grant select on public.hotspots to anon, authenticated;
create policy "public read" on public.hotspots for select to anon, authenticated using (true);
