import 'server-only';
import { createAdmin } from '@/lib/supabase/admin';
import { fetchHotspots } from '@/sources/firms';
import { fetchOpenMeteo } from '@/sources/openMeteo';
import type { RefreshDeps } from './refresh';

export function realDeps(startedAt: Date, afterStatus: RefreshDeps['afterStatus']): RefreshDeps {
  const db = createAdmin();
  const check = <T extends { error: { message: string } | null }>(r: T) => {
    if (r.error) throw new Error(r.error.message);
    return r;
  };
  return {
    async loadSchools() {
      const { data } = check(await db.from('schools').select('id, lat, lon').order('npsn'));
      return data ?? [];
    },
    fetchOpenMeteo,
    fetchHotspots,
    async saveHotspots(points) {
      const rounded = points.map((p) => [Math.round(p.lat * 1e4) / 1e4, Math.round(p.lon * 1e4) / 1e4]);
      check(await db.from('hotspots').upsert({ id: 1, points: rounded, updated_at: new Date().toISOString() }));
    },
    async saveForecasts(rows) {
      for (let i = 0; i < rows.length; i += 1000) {
        check(await db.from('forecasts').upsert(rows.slice(i, i + 1000), { onConflict: 'school_id,hazard,hour' }));
      }
      check(await db.from('forecasts').delete().lt('hour', new Date(startedAt.getTime() - 2 * 86400_000).toISOString()));
    },
    async saveStatus(list) {
      const updated_at = new Date().toISOString();
      check(await db.from('school_status').upsert(list.map((s) => ({ ...s, updated_at }))));
    },
    async logRun(ok, error) {
      check(await db.from('refresh_runs').insert({ started_at: startedAt.toISOString(), finished_at: new Date().toISOString(), ok, error: error ?? null }));
    },
    afterStatus,
  };
}
