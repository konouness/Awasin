\set ON_ERROR_STOP 1
begin;

insert into public.schools (id, npsn, name, lat, lon, kabupaten) values
  ('00000000-0000-0000-0000-0000000000a1', 'T0000001', 'Sekolah Uji A', -2.2, 113.9, 'Uji'),
  ('00000000-0000-0000-0000-0000000000b1', 'T0000002', 'Sekolah Uji B', -2.5, 112.9, 'Uji');
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000aaaa', 'uji-a@awasin.test'),
  ('00000000-0000-0000-0000-00000000bbbb', 'uji-b@awasin.test'),
  ('00000000-0000-0000-0000-00000000dddd', 'uji-d@awasin.test');
insert into public.profiles (id, role, school_id, name) values
  ('00000000-0000-0000-0000-00000000aaaa', 'sekolah', '00000000-0000-0000-0000-0000000000a1', 'A'),
  ('00000000-0000-0000-0000-00000000bbbb', 'sekolah', '00000000-0000-0000-0000-0000000000b1', 'B'),
  ('00000000-0000-0000-0000-00000000dddd', 'dinas', null, 'Dinas');
insert into public.field_reports (id, school_id, reporter_id, hazard, note) values
  ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-00000000bbbb', 'asap', 'laporan B');
insert into public.forecasts (school_id, hazard, hour, level, score) values
  ('00000000-0000-0000-0000-0000000000a1', 'asap', '2026-10-20T03:00:00Z', 2, 160);
insert into public.emergencies (id, school_id, hazard, reason, started_by) values
  ('00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-0000000000a1', 'asap', 'uji', 'otomatis'),
  ('00000000-0000-0000-0000-0000000000e2', '00000000-0000-0000-0000-0000000000b1', 'asap', 'uji', 'otomatis');

set local role anon;
do $$ begin
  perform 1 from public.schools limit 1;
  perform 1 from public.forecasts limit 1;
  perform 1 from public.school_status limit 1;
  perform 1 from public.refresh_runs limit 1;
  perform 1 from public.tasks limit 1;
  perform 1 from public.emergencies limit 1;
  if (select count(*) from public.schools where npsn like 'T000000%') <> 2 then raise exception 'anon cannot read schools'; end if;
end $$;
do $$ declare t text; n int; begin
  foreach t in array array['field_reports','health_checkins','telegram_chats','push_subscriptions','notify_state','profiles'] loop
    begin
      execute format('select count(*) from public.%I', t) into n;
    exception when insufficient_privilege then n := 0;
    end;
    if n > 0 then raise exception 'anon can read %', t; end if;
  end loop;
end $$;
reset role;

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000aaaa","role":"authenticated"}';
do $$ begin
  insert into public.field_reports (school_id, reporter_id, hazard, note)
  values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000aaaa', 'asap', 'laporan A');
end $$;
do $$ begin
  begin
    insert into public.field_reports (school_id, reporter_id, hazard, note)
    values ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-00000000aaaa', 'asap', 'palsu');
    raise exception 'school A inserted a report for school B';
  exception when insufficient_privilege then null;
  end;
end $$;
do $$ begin
  if exists (select 1 from public.field_reports where school_id <> '00000000-0000-0000-0000-0000000000a1') then
    raise exception 'school A sees other schools reports';
  end if;
  if (select count(*) from public.field_reports) <> 1 then raise exception 'school A should see exactly its 1 report'; end if;
end $$;
do $$ declare n int; begin
  insert into public.tasks (id, school_id, emergency_id, title)
  values ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000e1', 'Tugas A');
  delete from public.tasks where id = '00000000-0000-0000-0000-0000000000c1';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'school A cannot delete its task'; end if;
  begin
    insert into public.tasks (school_id, emergency_id, title)
    values ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000e2', 'Tugas palsu');
    raise exception 'school A inserted a task for school B';
  exception when insufficient_privilege then null;
  end;
end $$;
do $$ declare n int; begin
  update public.emergencies set ended_at = now() where id = '00000000-0000-0000-0000-0000000000e1';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'school A cannot end its emergency'; end if;
  update public.emergencies set ended_at = now() where id = '00000000-0000-0000-0000-0000000000e2';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'school A ended school B emergency'; end if;
end $$;
do $$ begin
  if (select count(*) from public.dinas_overview((now() at time zone 'Asia/Jakarta')::date)) <> 1 then
    raise exception 'dinas_overview should return only own school for a school account';
  end if;
end $$;
reset role;

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000dddd","role":"authenticated"}';
do $$ begin
  if (select count(*) from public.field_reports where school_id in ('00000000-0000-0000-0000-0000000000a1','00000000-0000-0000-0000-0000000000b1')) <> 2 then
    raise exception 'dinas should see reports of all schools';
  end if;
end $$;
do $$ begin
  if (select count(*) from public.dinas_overview((now() at time zone 'Asia/Jakarta')::date)) <> (select count(*) from public.schools) then
    raise exception 'dinas_overview should return every school for dinas';
  end if;
  if (select reports_today from public.dinas_overview((now() at time zone 'Asia/Jakarta')::date) where school_id = '00000000-0000-0000-0000-0000000000b1') <> 1 then
    raise exception 'dinas_overview should count today report of school B';
  end if;
  if (select public.predicted_level_at('00000000-0000-0000-0000-0000000000a1', 'asap', '2026-10-20T03:40:00Z')) <> 2 then
    raise exception 'predicted_level_at should truncate to the hour';
  end if;
end $$;
reset role;

insert into public.emergencies (school_id, hazard, reason, started_by) values ('00000000-0000-0000-0000-0000000000a1', 'asap', 'uji absen', 'sekolah');
update public.emergencies set ended_at = now() where school_id = '00000000-0000-0000-0000-0000000000b1';

set local role anon;
do $$ begin
  begin
    perform public.submit_checkin('T0000002', 'Budi', '4A', 'sehat', '{}');
    raise exception 'checkin accepted without active emergency';
  exception when others then
    if sqlerrm not like '%Tidak ada mode darurat aktif%' then raise; end if;
  end;
  perform public.submit_checkin('T0000001', 'Budi', '4A', 'sehat', '{}');
  perform public.submit_checkin('T0000001', 'budi ', '4A', 'sakit', '{batuk}');
  begin
    perform public.submit_checkin('T0000001', '', '4A', 'sehat', '{}');
    raise exception 'empty name accepted';
  exception when others then
    if sqlerrm = 'empty name accepted' then raise; end if;
  end;
  begin
    if (select count(*) from public.health_checkins) <> 0 then raise exception 'anon can read health_checkins'; end if;
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
do $$ begin
  if (select count(*) from public.health_checkins where school_id = '00000000-0000-0000-0000-0000000000a1') <> 1 then
    raise exception 'same student same day should be one row';
  end if;
  if (select status from public.health_checkins where school_id = '00000000-0000-0000-0000-0000000000a1') <> 'sakit' then
    raise exception 'latest checkin should win';
  end if;
  if (select date from public.health_checkins limit 1) <> (now() at time zone 'Asia/Jakarta')::date then
    raise exception 'checkin date should be the WIB date';
  end if;
end $$;

select 'rls ok';
rollback;
