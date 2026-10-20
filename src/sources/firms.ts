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

export async function fetchHotspots(): Promise<Point[]> {
  const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${process.env.FIRMS_MAP_KEY}/VIIRS_NOAA21_NRT/108.5,-4.3,119.3,4.5/2`;
  const res = await fetch(url, { cache: 'no-store' });
  if (res.status !== 200) throw new Error(`FIRMS ${res.status}`);
  const text = await res.text();
  if (!text.startsWith('latitude')) throw new Error(`FIRMS: ${text.slice(0, 80)}`);
  return parseFirmsCsv(text);
}
