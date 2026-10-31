drop policy "read own school or dinas" on public.health_checkins;
create policy "read own school" on public.health_checkins for select to authenticated
  using (school_id = (select public.my_school_id()));

create or replace function public.dinas_overview(p_date date)
returns table (school_id uuid, npsn text, name text, kabupaten text, action text, hazard text, levels jsonb, reports_today int, sick_reported int, sick_checkins int, emergency_active boolean)
language sql stable security definer set search_path = ''
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

revoke execute on function public.dinas_overview(date) from public, anon;
grant execute on function public.dinas_overview(date) to authenticated, service_role;
