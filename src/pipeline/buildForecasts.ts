import { upwindHotspotCount } from '@/risk/geo';
import { levelAngin, levelAsap, levelBanjir, recommend } from '@/risk/score';
import { type Action, type ForecastRow, type Hazard, type HourRow, type Level, type Point } from '@/risk/types';

const HOUR = 3600_000;

export type SchoolStatus = { school_id: string; action: Action; hazard: Hazard | null; levels: Record<Hazard, Level> };

export function buildForecasts(schools: (Point & { id: string })[], hourly: Map<string, HourRow[]>, hotspots: Point[], now: Date): ForecastRow[] {
  const start = Math.floor(now.getTime() / HOUR) * HOUR;
  const rows: ForecastRow[] = [];
  for (const s of schools) {
    const hours = hourly.get(s.id);
    if (!hours?.length) continue;
    const byTime = new Map(hours.map((h, i) => [Date.parse(h.time), i]));
    for (let k = 0; k < 24; k++) {
      const t = start + k * HOUR;
      const i = byTime.get(t);
      if (i === undefined) continue;
      const h = hours[i];
      const rain24 = Math.round(hours.slice(Math.max(0, i - 23), i + 1).reduce((a, x) => a + x.rainMm, 0) * 10) / 10;
      const upwind = upwindHotspotCount(s, hotspots, h.windFromDeg);
      const hour = new Date(t).toISOString();
      rows.push(
        { school_id: s.id, hazard: 'asap', hour, level: levelAsap(h.pm25, upwind), score: h.pm25 },
        { school_id: s.id, hazard: 'banjir', hour, level: levelBanjir(rain24), score: rain24 },
        { school_id: s.id, hazard: 'angin', hour, level: levelAngin(h.gustKmh, h.weatherCode), score: h.gustKmh },
      );
    }
  }
  return rows;
}

export function statusFrom(rows: ForecastRow[], schoolId: string, now: Date): SchoolStatus {
  const start = Math.floor(now.getTime() / HOUR) * HOUR;
  const end = start + 6 * HOUR;
  const levels = { asap: 0, banjir: 0, angin: 0 } as Record<Hazard, Level>;
  for (const r of rows) {
    if (r.school_id !== schoolId) continue;
    const t = Date.parse(r.hour);
    if (t < start || t >= end) continue;
    if (r.level > levels[r.hazard]) levels[r.hazard] = r.level;
  }
  return { school_id: schoolId, ...recommend(levels), levels };
}

