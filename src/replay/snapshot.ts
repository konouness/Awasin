import { buildForecasts, statusFrom, type SchoolStatus } from '@/pipeline/buildForecasts';
import type { ForecastRow, Point } from '@/risk/types';
import { fetchHotspots } from '@/sources/firms';
import { fetchOpenMeteo } from '@/sources/openMeteo';

export type Snapshot = { day: string; at: string; fires: [number, number][]; schools: Record<string, { status: SchoolStatus; rows: ForecastRow[] }> };

export async function snapshotAt(schools: (Point & { id: string; npsn: string })[], day: string): Promise<Snapshot> {
  const now = new Date(`${day}T06:00:00+07:00`);
  const [hourly, hotspots] = await Promise.all([fetchOpenMeteo(schools, day), fetchHotspots(day)]);
  const rows = buildForecasts(schools, hourly, hotspots, now);
  const out: Snapshot['schools'] = {};
  for (const s of schools) {
    const mine = rows.filter((r) => r.school_id === s.id);
    if (mine.length) out[s.npsn] = { status: statusFrom(mine, s.id, now), rows: mine };
  }
  return {
    day,
    at: now.toISOString(),
    fires: hotspots.map((p) => [Math.round(p.lat * 1e4) / 1e4, Math.round(p.lon * 1e4) / 1e4]),
    schools: out,
  };
}
