import { writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { REPLAY_DAYS } from '../src/replay/days';
import { snapshotAt, type Snapshot } from '../src/replay/snapshot';

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!, { auth: { persistSession: false } });
const { data: schools, error } = await db.from('schools').select('id, npsn, lat, lon').order('npsn');
if (error || !schools) throw new Error(error?.message ?? 'no schools');

const out: Record<string, Snapshot> = {};
for (const day of REPLAY_DAYS) {
  const s = await snapshotAt(schools, day);
  const counts: Record<string, number> = {};
  for (const x of Object.values(s.schools)) counts[x.status.action] = (counts[x.status.action] ?? 0) + 1;
  console.log(day, Object.keys(s.schools).length, 'sekolah', counts, s.fires.length, 'titik api');
  out[day] = s;
  await new Promise((r) => setTimeout(r, 2000));
}
const json = JSON.stringify(out);
writeFileSync(new URL('../src/replay/data.json', import.meta.url), json);
console.log('data.json', Math.round(json.length / 1024), 'KB');
