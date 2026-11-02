import { readFileSync } from 'node:fs';
import { FIRMS_BBOX } from '../src/sources/firms';

const sql = readFileSync(new URL('../supabase/seed.sql', import.meta.url), 'utf8');
const rows = [...sql.matchAll(/\('(\d{8})', '([^']+)', (-?[\d.]+), (-?[\d.]+), '([^']+)', '([^']+)'\)/g)].map((m) => ({
  npsn: m[1], name: m[2], lat: Number(m[3]), lon: Number(m[4]), kabupaten: m[5], provinsi: m[6],
}));

test('every seeded school is real-shaped, inside the FIRMS area, and within quota', () => {
  expect(rows.length).toBeGreaterThanOrEqual(73);
  expect(rows.length).toBeLessThanOrEqual(150);
  expect(new Set(rows.map((r) => r.npsn)).size).toBe(rows.length);
  for (const r of rows) {
    expect(r.lat).toBeGreaterThan(FIRMS_BBOX.south); expect(r.lat).toBeLessThan(FIRMS_BBOX.north);
    expect(r.lon).toBeGreaterThan(FIRMS_BBOX.west); expect(r.lon).toBeLessThan(FIRMS_BBOX.east);
    expect(r.lat).not.toBe(0); expect(r.lon).not.toBe(0);
  }
  expect(new Set(rows.map((r) => r.provinsi))).toEqual(new Set(['Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara', 'Banten', 'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur', 'Sulawesi Utara', 'Gorontalo', 'Sulawesi Tengah', 'Sulawesi Barat', 'Sulawesi Selatan', 'Sulawesi Tenggara']));
  expect(rows.filter((r) => r.provinsi === 'Kalimantan Tengah')).toHaveLength(25);
});
