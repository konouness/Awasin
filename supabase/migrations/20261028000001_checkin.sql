create function public.submit_checkin(p_npsn text, p_name text, p_class text, p_status text, p_symptoms text[])
returns date
language plpgsql security definer set search_path = ''
as $$
declare
  v_school uuid;
  v_emergency uuid;
  v_name text := btrim(coalesce(p_name, ''));
  v_class text := upper(btrim(coalesce(p_class, '')));
  v_date date := (now() at time zone 'Asia/Jakarta')::date;
  v_symptoms text[];
begin
  if char_length(v_name) = 0 or char_length(v_name) > 60 then raise exception 'Nama wajib diisi, maksimal 60 karakter'; end if;
  if char_length(v_class) = 0 or char_length(v_class) > 60 then raise exception 'Kelas wajib diisi, maksimal 60 karakter'; end if;
  if p_status not in ('sehat', 'sakit') then raise exception 'Status harus sehat atau sakit'; end if;
  select array_agg(distinct s) into v_symptoms from unnest(coalesce(p_symptoms, '{}')) s where s in ('batuk', 'sesak', 'demam', 'mata_perih');
  select id into v_school from public.schools where npsn = p_npsn;
  if v_school is null then raise exception 'Sekolah tidak ditemukan'; end if;
  select id into v_emergency from public.emergencies where school_id = v_school and ended_at is null;
  if v_emergency is null then raise exception 'Tidak ada mode darurat aktif'; end if;
  insert into public.health_checkins (school_id, emergency_id, student_name, class, status, symptoms, date)
  values (v_school, v_emergency, v_name, v_class, p_status, case when p_status = 'sakit' then coalesce(v_symptoms, '{}') else '{}' end, v_date)
  on conflict (school_id, lower(student_name), class, date)
  do update set status = excluded.status, symptoms = excluded.symptoms, emergency_id = excluded.emergency_id, student_name = excluded.student_name, created_at = now();
  return v_date;
end
$$;

revoke execute on function public.submit_checkin(text, text, text, text, text[]) from public;
grant execute on function public.submit_checkin(text, text, text, text, text[]) to anon, authenticated, service_role;
