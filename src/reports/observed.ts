import type { Hazard, Level } from '@/risk/types';

export type ReportInput = {
  hazard: Hazard;
  visibility_m?: number | null;
  smoke_smell?: boolean | null;
  water_depth_cm?: number | null;
  wind_felt?: 'tidak' | 'kencang' | 'merusak' | null;
};

export function observedLevel(r: ReportInput): Level {
  if (r.hazard === 'asap') {
    const v = r.visibility_m;
    const byVis = v == null ? 0 : v < 200 ? 3 : v < 500 ? 2 : v < 1000 ? 1 : 0;
    return Math.max(byVis, r.smoke_smell ? 1 : 0) as Level;
  }
  if (r.hazard === 'banjir') {
    const d = r.water_depth_cm ?? 0;
    return (d >= 50 ? 3 : d >= 30 ? 2 : d >= 10 ? 1 : 0) as Level;
  }
  return (r.wind_felt === 'merusak' ? 2 : r.wind_felt === 'kencang' ? 1 : 0) as Level;
}
