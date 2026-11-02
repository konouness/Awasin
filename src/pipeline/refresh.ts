import type { ForecastRow, HourRow, Point } from '@/risk/types';
import { firesNear } from '@/replay/snapshot';
import { buildForecasts, statusFrom, type SchoolStatus } from './buildForecasts';

export type RefreshDeps = {
  loadSchools(): Promise<(Point & { id: string })[]>;
  fetchOpenMeteo(schools: (Point & { id: string })[]): Promise<Map<string, HourRow[]>>;
  fetchHotspots(): Promise<Point[]>;
  saveHotspots(points: Point[]): Promise<void>;
  saveForecasts(rows: ForecastRow[]): Promise<void>;
  saveStatus(s: SchoolStatus[]): Promise<void>;
  logRun(ok: boolean, error?: string): Promise<void>;
  afterStatus(s: SchoolStatus[]): Promise<void>;
};

const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));

export async function refresh(deps: RefreshDeps, now: Date): Promise<{ ok: boolean; schools: number; error?: string }> {
  let statuses: SchoolStatus[];
  try {
    const schools = await deps.loadSchools();
    const [hourly, hotspots] = await Promise.all([deps.fetchOpenMeteo(schools), deps.fetchHotspots()]);
    await deps.saveHotspots(firesNear(hotspots, schools, 100)).catch(() => {});
    const rows = buildForecasts(schools, hourly, hotspots, now);
    if (rows.length === 0) throw new Error('Tidak ada data prakiraan');
    await deps.saveForecasts(rows);
    statuses = schools.filter((s) => hourly.get(s.id)?.length).map((s) => statusFrom(rows, s.id, now));
    await deps.saveStatus(statuses);
  } catch (e) {
    await deps.logRun(false, msg(e));
    return { ok: false, schools: 0, error: msg(e) };
  }
  let note: string | undefined;
  try {
    await deps.afterStatus(statuses);
  } catch (e) {
    note = `notifikasi: ${msg(e)}`;
  }
  await deps.logRun(true, note);
  return { ok: true, schools: statuses.length };
}
