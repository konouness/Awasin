import { writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { snapshotAt } from '../src/replay/snapshot';
import { openMeteoUrls } from '../src/sources/openMeteo';

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!, { auth: { persistSession: false } });
const { data: schools, error } = await db.from('schools').select('id, npsn, lat, lon').eq('provinsi', 'Kalimantan Tengah').order('npsn');
if (error || !schools) throw new Error(error?.message ?? 'no schools');

const ACTIONS = ['normal', 'kurangi_luar', 'tunda_masuk', 'pulang_awal', 'daring'] as const;
const lines = ['day,pm25_max_06wib,n_normal,n_kurangi_luar,n_tunda_masuk,n_pulang_awal,n_daring,pm25_null_hours'];
let firstTunda = '';
let firstDaring = '';
for (let t = Date.parse('2026-08-01T00:00:00Z'); t <= Date.parse('2026-08-31T00:00:00Z'); t += 86400000) {
  const day = new Date(t).toISOString().slice(0, 10);
  const s = await snapshotAt(schools, day);
  const air = (await (await fetch(openMeteoUrls(schools, day).air)).json()) as { hourly: { pm2_5: (number | null)[] } }[];
  const nulls = air.reduce((n, a) => n + a.hourly.pm2_5.filter((v) => v === null).length, 0);
  const list = Object.values(s.schools);
  const pm = Math.max(0, ...list.flatMap((x) => x.rows.filter((r) => r.hazard === 'asap' && r.hour === s.at).map((r) => r.score)));
  const n = ACTIONS.map((a) => list.filter((x) => x.status.action === a).length);
  if (!firstTunda && n[2] > 0) firstTunda = day;
  if (!firstDaring && n[4] > 0) firstDaring = day;
  lines.push([day, Math.round(pm * 10) / 10, ...n, nulls].join(','));
  console.log(lines[lines.length - 1]);
  await new Promise((r) => setTimeout(r, 2000));
}
writeFileSync(new URL('../docs/backtest/backtest.csv', import.meta.url), lines.join('\n') + '\n');
console.log('first tunda_masuk:', firstTunda || 'none', '| first daring:', firstDaring || 'none');
