create function public.predicted_level_at(p_school uuid, p_hazard text, p_at timestamptz) returns smallint
language sql stable security invoker set search_path = ''
as $$
  select level from public.forecasts
  where school_id = p_school and hazard = p_hazard and hour = date_trunc('hour', p_at)
$$;

create function public.dinas_overview(p_date date)
returns table (school_id uuid, npsn text, name text, kabupaten text, action text, hazard text, levels jsonb, reports_today int, sick_reported int, sick_checkins int, emergency_active boolean)
language sql stable security invoker set search_path = ''
as $$
  with day as (
    select (p_date::timestamp at time zone 'Asia/Jakarta') as lo,
           ((p_date + 1)::timestamp at time zone 'Asia/Jakarta') as hi
  )
  select s.id, s.npsn, s.name, s.kabupaten,
    coalesce(st.action, 'normal'), st.hazard, st.levels,
    (select count(*)::int from public.field_reports r, day where r.school_id = s.id and r.created_at >= day.lo and r.created_at < day.hi),
    (select coalesce(sum(r.students_sick), 0)::int from public.field_reports r, day where r.school_id = s.id and r.created_at >= day.lo and r.created_at < day.hi),
    (select count(*)::int from public.health_checkins h where h.school_id = s.id and h.date = p_date and h.status = 'sakit'),
    exists (select 1 from public.emergencies e where e.school_id = s.id and e.ended_at is null)
  from public.schools s
  left join public.school_status st on st.school_id = s.id
  where (select public.is_dinas()) or s.id = (select public.my_school_id())
$$;

revoke execute on function public.predicted_level_at(uuid, text, timestamptz) from public, anon;
revoke execute on function public.dinas_overview(date) from public, anon;
grant execute on function public.predicted_level_at(uuid, text, timestamptz) to authenticated, service_role;
grant execute on function public.dinas_overview(date) to authenticated, service_role;
