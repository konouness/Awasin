import type { Point } from '@/risk/types';

export function parseFirmsCsv(csv: string): Point[] {
  const lines = csv.trim().split(/\r?\n/);
  const head = (lines.shift() ?? '').split(',');
  const iLat = head.indexOf('latitude');
  const iLon = head.indexOf('longitude');
  if (iLat < 0 || iLon < 0) return [];
  const out: Point[] = [];
  for (const line of lines) {
    const c = line.split(',');
    const lat = Number(c[iLat]);
    const lon = Number(c[iLon]);
    if (c[iLat] && c[iLon] && Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) out.push({ lat, lon });
  }
  return out;
}

export const FIRMS_BBOX = { west: 105, south: -9, east: 127.5, north: 6 } as const;

export function firmsUrl(key: string, day?: string): string {
  const { west, south, east, north } = FIRMS_BBOX;
  const base = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${key}/VIIRS_NOAA21_NRT/${west},${south},${east},${north}/2`;
  if (!day) return base;
  return `${base}/${new Date(new Date(day + 'T00:00:00Z').getTime() - 2 * 86400000).toISOString().slice(0, 10)}`;
}

export async function fetchHotspots(day?: string): Promise<Point[]> {
  const res = await fetch(firmsUrl(process.env.FIRMS_MAP_KEY ?? '', day), { cache: 'no-store' });
  if (res.status !== 200) throw new Error(`FIRMS ${res.status}`);
  const text = await res.text();
  if (!text.startsWith('latitude')) throw new Error(`FIRMS: ${text.slice(0, 80)}`);
  return parseFirmsCsv(text);
}
