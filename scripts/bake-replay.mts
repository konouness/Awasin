import { readFileSync, writeFileSync } from 'node:fs';
import { REPLAY_DAYS } from '../src/replay/days';
import { snapshotAt, type Snapshot } from '../src/replay/snapshot';

const sql = readFileSync(new URL('../supabase/seed.sql', import.meta.url), 'utf8');
const schools = [...sql.matchAll(/\('(\d{8})', '[^']+', (-?[\d.]+), (-?[\d.]+), /g)]
  .map((m) => ({ id: m[1], npsn: m[1], lat: Number(m[2]), lon: Number(m[3]) }))
  .sort((a, b) => a.npsn.localeCompare(b.npsn));
if (schools.length === 0) throw new Error('no schools in seed.sql');

const out: Record<string, Snapshot> = {};
for (const day of REPLAY_DAYS) {
  const s = await snapshotAt(schools, day);
  const counts: Record<string, number> = {};
  for (const x of Object.values(s.schools)) counts[x.status.action] = (counts[x.status.action] ?? 0) + 1;
  console.log(day, Object.keys(s.schools).length, 'sekolah', counts, s.fires.length, 'titik panas');
  out[day] = s;
  await new Promise((r) => setTimeout(r, 2000));
}
const json = JSON.stringify(out);
writeFileSync(new URL('../src/replay/data.json', import.meta.url), json);
console.log('data.json', Math.round(json.length / 1024), 'KB');
