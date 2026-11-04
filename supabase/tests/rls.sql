\set ON_ERROR_STOP 1
begin;

insert into public.schools (id, npsn, name, lat, lon, kabupaten) values
  ('00000000-0000-0000-0000-0000000000a1', 'T0000001', 'Sekolah Uji A', -2.2, 113.9, 'Uji');
insert into public.forecasts (school_id, hazard, hour, level, score) values
  ('00000000-0000-0000-0000-0000000000a1', 'asap', '2026-10-20T03:00:00Z', 2, 160);
insert into public.telegram_chats (chat_id, school_id) values (-1, '00000000-0000-0000-0000-0000000000a1');
insert into public.notify_state (school_id, hazard, level) values ('00000000-0000-0000-0000-0000000000a1', 'asap', 2);

set local role anon;
do $$ begin
  perform 1 from public.schools limit 1;
  perform 1 from public.forecasts limit 1;
  perform 1 from public.school_status limit 1;
  perform 1 from public.refresh_runs limit 1;
  perform 1 from public.hotspots limit 1;
  if (select count(*) from public.schools where npsn = 'T0000001') <> 1 then raise exception 'anon cannot read schools'; end if;
  if (select count(*) from public.forecasts where school_id = '00000000-0000-0000-0000-0000000000a1') <> 1 then raise exception 'anon cannot read forecasts'; end if;
end $$;
do $$ declare t text; n int; begin
  foreach t in array array['telegram_chats','notify_state'] loop
    begin
      execute format('select count(*) from public.%I', t) into n;
    exception when insufficient_privilege then n := 0;
    end;
    if n > 0 then raise exception 'anon can read %', t; end if;
  end loop;
end $$;
do $$ begin
  begin
    insert into public.schools (npsn, name, lat, lon, kabupaten) values ('T0000009', 'Palsu', -2, 113, 'Uji');
    raise exception 'anon inserted a school';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

select 'rls ok';
rollback;
