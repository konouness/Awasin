import type { HourRow, Point } from '@/risk/types';

type Hourly = Record<string, (number | null)[]> & { time: string[] };
type Loc = { hourly: Hourly };

const list = (x: unknown): Loc[] => (Array.isArray(x) ? x : [x]) as Loc[];
const num = (v: number | null | undefined) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

export function parseOpenMeteo(forecast: unknown, air: unknown, schoolIds: string[]): Map<string, HourRow[]> {
  const f = list(forecast);
  const a = list(air);
  if (f.length !== schoolIds.length || a.length !== schoolIds.length) throw new Error('Open-Meteo: jumlah lokasi tidak cocok');
  const out = new Map<string, HourRow[]>();
  schoolIds.forEach((id, i) => {
    const fh = f[i].hourly;
    const pmByTime = new Map(a[i].hourly.time.map((t, j) => [t, num(a[i].hourly.pm2_5[j])]));
    out.set(
      id,
      fh.time.map((t, j) => ({
        time: new Date(t + 'Z').toISOString(),
        rainMm: num(fh.precipitation[j]),
        gustKmh: num(fh.wind_gusts_10m[j]),
        windFromDeg: num(fh.wind_direction_10m[j]),
        weatherCode: num(fh.weather_code[j]),
        pm25: pmByTime.get(t) ?? 0,
      })),
    );
  });
  return out;
}

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, { cache: 'no-store' });
  if (res.status !== 200) throw new Error(`Open-Meteo ${res.status}`);
  return res.json();
}

const shift = (day: string, d: number) => new Date(new Date(day + 'T00:00:00Z').getTime() + d * 86400000).toISOString().slice(0, 10);

export function openMeteoUrls(schools: Point[], day?: string): { forecast: string; air: string } {
  const lat = schools.map((s) => s.lat).join(',');
  const lon = schools.map((s) => s.lon).join(',');
  const range = day ? `start_date=${shift(day, -1)}&end_date=${shift(day, 1)}` : 'past_days=1&forecast_days=2';
  const common = `latitude=${lat}&longitude=${lon}&${range}&timezone=GMT`;
  const host = day ? 'historical-forecast-api.open-meteo.com' : 'api.open-meteo.com';
  return {
    forecast: `https://${host}/v1/forecast?${common}&hourly=precipitation,wind_gusts_10m,wind_direction_10m,weather_code`,
    air: `https://air-quality-api.open-meteo.com/v1/air-quality?${common}&hourly=pm2_5`,
  };
}

export async function fetchOpenMeteo(schools: (Point & { id: string })[], day?: string): Promise<Map<string, HourRow[]>> {
  const u = openMeteoUrls(schools, day);
  const [forecast, air] = await Promise.all([getJson(u.forecast), getJson(u.air)]);
  return parseOpenMeteo(forecast, air, schools.map((s) => s.id));
}
