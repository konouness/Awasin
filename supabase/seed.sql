begin;

insert into public.schools (npsn, name, lat, lon, kabupaten) values
  ('30200156', 'SD NEGERI 1 BARANGGAU', -3.3226, 114.313, 'Kapuas'),
  ('30200687', 'SD NEGERI 1 BATANJUNG', -3.1259, 114.3098, 'Kapuas'),
  ('30200592', 'SD NEGERI 1 CEMARA LABAT', -3.4179, 114.2835, 'Kapuas'),
  ('30200817', 'SD NEGERI 1 DAMPARAN', -2.1396, 114.8675, 'Barito Selatan'),
  ('30200824', 'SD NEGERI 1 MENGKATIP', -2.2282, 114.8538, 'Barito Selatan'),
  ('30201081', 'SD NEGERI 1 KAMAWEN', -1.1684704, 114.8293627, 'Barito Utara'),
  ('30201467', 'SD NEGERI 1 BASIRIH HILIR', -2.8426, 112.9626, 'Kotawaringin Timur'),
  ('30201468', 'SD NEGERI 1 BASIRIH HULU', -2.8218, 112.9503, 'Kotawaringin Timur'),
  ('30201477', 'SD NEGERI 1 JAYA KARET', -2.8239, 112.9299, 'Kotawaringin Timur'),
  ('30201761', 'SD NEGERI 1 BABUAL BABOTI', -2.5833, 111.3214, 'Kotawaringin Barat'),
  ('30202833', 'SD NEGERI 1 BANGUN JAYA', -3.0978, 113.3067, 'Katingan'),
  ('30203690', 'SD NEGERI 1 BUMI INDAH', -2.9267, 113.5135, 'Katingan'),
  ('30203122', 'SD NEGERI 1 BAUNG', -2.8784, 112.2568, 'Seruyan'),
  ('30202599', 'SD NEGERI KUALA JELAI 1', -2.9861, 110.741, 'Sukamara'),
  ('30202991', 'SD NEGERI ARGA MULYA', -2.1456, 111.394, 'Lamandau'),
  ('30205647', 'SD NEGERI 1 SARE RANGAN', -0.8614, 113.6981, 'Gunung Mas'),
  ('30205195', 'SD NEGERI 1 TEWAH', -1.0499, 113.7232, 'Gunung Mas'),
  ('30202128', 'SD NEGERI BAHAUR HILIR', -3.239, 114.099, 'Pulang Pisau'),
  ('30202127', 'SD NEGERI BAHAUR HULU 1', -3.2124, 114.1093, 'Pulang Pisau'),
  ('30203303', 'SD NEGERI BATU BUA I 2', -0.323954, 114.712312, 'Murung Raya'),
  ('30202502', 'SD NEGERI 1 JAAR', -2.1437, 115.1944, 'Barito Timur'),
  ('30203587', 'SD NEGERI 1 LANGKAI', -2.2091, 113.9251, 'Kota Palangka Raya'),
  ('30203558', 'SD NEGERI 1 PAHANDUT', -2.2076, 113.9349, 'Kota Palangka Raya'),
  ('30204387', 'SD NEGERI 1 PAHANDUT SEBERANG', -2.2009, 113.9361, 'Kota Palangka Raya'),
  ('30203426', 'SD NEGERI 1 PANARUNG', -2.2352, 113.9342, 'Kota Palangka Raya')
on conflict (npsn) do update set name = excluded.name, lat = excluded.lat, lon = excluded.lon, kabupaten = excluded.kabupaten;

create temp table demo_accounts_tx on commit drop as
select gen_random_uuid() as id, 'demo+' || npsn || '@awasin.id' as email, 'sekolah' as role, id as school_id, name
from public.schools
union all
select gen_random_uuid(), 'dinas@awasin.id', 'dinas', null, 'Dinas Pendidikan Kalimantan Tengah';

do $$ begin
  if coalesce(current_setting('app.demo_password', true), '') = '' then
    raise exception 'set app.demo_password first';
  end if;
end $$;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, reauthentication_token, phone_change, phone_change_token)
select '00000000-0000-0000-0000-000000000000', a.id, 'authenticated', 'authenticated', a.email,
  extensions.crypt(current_setting('app.demo_password'), extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now(),
  '', '', '', '', '', '', '', ''
from demo_accounts_tx a
where not exists (select 1 from auth.users u where u.email = a.email);

update auth.users u set encrypted_password = extensions.crypt(current_setting('app.demo_password'), extensions.gen_salt('bf')), updated_at = now()
from demo_accounts_tx a where u.email = a.email;

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id, u.id::text, 'email',
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true), now(), now(), now()
from auth.users u join demo_accounts_tx a on a.email = u.email
where not exists (select 1 from auth.identities i where i.user_id = u.id and i.provider = 'email');

insert into public.profiles (id, role, school_id, name)
select u.id, a.role, a.school_id, a.name
from auth.users u join demo_accounts_tx a on a.email = u.email
on conflict (id) do update set role = excluded.role, school_id = excluded.school_id, name = excluded.name;

commit;
