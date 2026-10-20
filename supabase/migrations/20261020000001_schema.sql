create table public.schools (
  id uuid primary key default gen_random_uuid(),
  npsn text not null unique,
  name text not null,
  lat float8 not null,
  lon float8 not null,
  kabupaten text not null
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('sekolah', 'dinas')),
  school_id uuid references public.schools (id),
  name text not null,
  check ((role = 'sekolah') = (school_id is not null))
);

create table public.forecasts (
  school_id uuid not null references public.schools (id) on delete cascade,
  hazard text not null check (hazard in ('asap', 'banjir', 'angin')),
  hour timestamptz not null,
  level smallint not null check (level between 0 and 3),
  score real not null,
  primary key (school_id, hazard, hour)
);

create table public.school_status (
  school_id uuid primary key references public.schools (id) on delete cascade,
  action text not null check (action in ('normal', 'kurangi_luar', 'tunda_masuk', 'pulang_awal', 'daring')),
  hazard text check (hazard in ('asap', 'banjir', 'angin')),
  levels jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.refresh_runs (
  id bigserial primary key,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  ok boolean not null,
  error text
);

create table public.field_reports (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  reporter_id uuid not null references auth.users (id),
  hazard text not null check (hazard in ('asap', 'banjir', 'angin')),
  visibility_m int check (visibility_m >= 0),
  smoke_smell boolean,
  water_depth_cm int check (water_depth_cm >= 0),
  wind_felt text check (wind_felt in ('tidak', 'kencang', 'merusak')),
  students_sick int not null default 0 check (students_sick >= 0),
  note text check (char_length(note) <= 1000),
  photo_path text,
  created_at timestamptz not null default now()
);
create index field_reports_school_created on public.field_reports (school_id, created_at desc);

create table public.emergencies (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  hazard text check (hazard in ('asap', 'banjir', 'angin')),
  reason text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  started_by text not null check (started_by in ('otomatis', 'sekolah'))
);
create unique index emergencies_one_active on public.emergencies (school_id) where ended_at is null;

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  emergency_id uuid not null references public.emergencies (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  url text check (url ~ '^https?://'),
  body text check (char_length(body) <= 2000),
  created_at timestamptz not null default now()
);

create table public.health_checkins (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  emergency_id uuid not null references public.emergencies (id) on delete cascade,
  student_name text not null,
  class text not null,
  status text not null check (status in ('sehat', 'sakit')),
  symptoms text[] not null default '{}',
  date date not null,
  created_at timestamptz not null default now()
);
create unique index health_checkins_one_per_day on public.health_checkins (school_id, lower(student_name), class, date);

create table public.notify_state (
  school_id uuid not null references public.schools (id) on delete cascade,
  hazard text not null check (hazard in ('asap', 'banjir', 'angin')),
  level smallint not null,
  updated_at timestamptz not null default now(),
  primary key (school_id, hazard)
);

create table public.telegram_chats (
  chat_id bigint primary key,
  school_id uuid not null references public.schools (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.push_subscriptions (
  endpoint text primary key,
  school_id uuid not null references public.schools (id) on delete cascade,
  keys jsonb not null,
  created_at timestamptz not null default now()
);

create function public.my_school_id() returns uuid
language sql stable security definer set search_path = ''
as $$ select school_id from public.profiles where id = auth.uid() $$;

create function public.is_dinas() returns boolean
language sql stable security definer set search_path = ''
as $$ select coalesce((select role = 'dinas' from public.profiles where id = auth.uid()), false) $$;

revoke execute on function public.my_school_id() from public, anon;
revoke execute on function public.is_dinas() from public, anon;
grant execute on function public.my_school_id() to authenticated;
grant execute on function public.is_dinas() to authenticated;

alter table public.schools enable row level security;
alter table public.profiles enable row level security;
alter table public.forecasts enable row level security;
alter table public.school_status enable row level security;
alter table public.refresh_runs enable row level security;
alter table public.field_reports enable row level security;
alter table public.emergencies enable row level security;
alter table public.tasks enable row level security;
alter table public.health_checkins enable row level security;
alter table public.notify_state enable row level security;
alter table public.telegram_chats enable row level security;
alter table public.push_subscriptions enable row level security;

revoke all on all tables in schema public from anon, authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

grant select on public.schools, public.forecasts, public.school_status, public.refresh_runs, public.tasks, public.emergencies to anon, authenticated;
grant select on public.profiles, public.field_reports, public.health_checkins to authenticated;
grant insert (school_id, reporter_id, hazard, visibility_m, smoke_smell, water_depth_cm, wind_felt, students_sick, note, photo_path) on public.field_reports to authenticated;
grant insert (id, school_id, emergency_id, title, url, body), delete on public.tasks to authenticated;
grant update (ended_at) on public.emergencies to authenticated;

create policy "public read" on public.schools for select to anon, authenticated using (true);
create policy "public read" on public.forecasts for select to anon, authenticated using (true);
create policy "public read" on public.school_status for select to anon, authenticated using (true);
create policy "public read" on public.refresh_runs for select to anon, authenticated using (true);
create policy "public read" on public.tasks for select to anon, authenticated using (true);
create policy "public read" on public.emergencies for select to anon, authenticated using (true);

create policy "own profile" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_dinas()));

create policy "read own school or dinas" on public.field_reports for select to authenticated
  using (school_id = (select public.my_school_id()) or (select public.is_dinas()));
create policy "insert own school" on public.field_reports for insert to authenticated
  with check (school_id = (select public.my_school_id()) and reporter_id = (select auth.uid()));

create policy "insert own school" on public.tasks for insert to authenticated
  with check (school_id = (select public.my_school_id()));
create policy "delete own school" on public.tasks for delete to authenticated
  using (school_id = (select public.my_school_id()));

create policy "end own school" on public.emergencies for update to authenticated
  using (school_id = (select public.my_school_id()))
  with check (school_id = (select public.my_school_id()));

create policy "read own school or dinas" on public.health_checkins for select to authenticated
  using (school_id = (select public.my_school_id()) or (select public.is_dinas()));

insert into storage.buckets (id, name, public) values ('reports', 'reports', false);

create policy "reports insert own school" on storage.objects for insert to authenticated
  with check (bucket_id = 'reports' and (storage.foldername(name))[1] = (select public.my_school_id())::text);
create policy "reports read own school or dinas" on storage.objects for select to authenticated
  using (bucket_id = 'reports' and ((storage.foldername(name))[1] = (select public.my_school_id())::text or (select public.is_dinas())));
