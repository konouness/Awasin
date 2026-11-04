import { readFileSync } from 'node:fs';
import { openMeteoUrls, parseOpenMeteo } from '../../src/sources/openMeteo';
import { FIRMS_BBOX, firmsUrl, parseFirmsCsv } from '../../src/sources/firms';
const fx = (f: string) => readFileSync(new URL(`../fixtures/${f}`, import.meta.url), 'utf8');
const forecastFixture = JSON.parse(fx('open-meteo-forecast.json'));
const airFixture = JSON.parse(fx('open-meteo-air.json'));
const firmsFixture = fx('firms.csv');
test('parseOpenMeteo maps every school to 72 hourly rows', () => {
  const m = parseOpenMeteo(forecastFixture, airFixture, ['a', 'b']);
  expect(m.get('a')!.length).toBe(72);
  expect(m.get('b')![0]).toEqual(expect.objectContaining({ rainMm: expect.any(Number), pm25: expect.any(Number) }));
  expect(m.get('a')![0].time).toMatch(/Z$/);
});
test('parseOpenMeteo turns null values into 0', () => {
  const f = structuredClone(forecastFixture); const a = structuredClone(airFixture);
  a[0].hourly.pm2_5[0] = null; f[0].hourly.precipitation[0] = null;
  const row = parseOpenMeteo(f, a, ['a', 'b']).get('a')![0];
  expect(row.pm25).toBe(0); expect(row.rainMm).toBe(0);
});
test('parseOpenMeteo accepts a single-location object', () => {
  expect(parseOpenMeteo(forecastFixture[0], airFixture[0], ['a']).get('a')!.length).toBe(72);
});
test('parseFirmsCsv skips broken rows', () => { expect(parseFirmsCsv(firmsFixture)).toHaveLength(3); });

test('open-meteo urls switch to archive for a past day', () => {
  const live = openMeteoUrls([{ lat: -2.2, lon: 113.9 }]);
  expect(live.forecast).toContain('api.open-meteo.com'); expect(live.forecast).toContain('past_days=1');
  const past = openMeteoUrls([{ lat: -2.2, lon: 113.9 }], '2026-08-09');
  expect(past.forecast).toContain('historical-forecast-api.open-meteo.com');
  expect(past.forecast).toContain('start_date=2026-08-08&end_date=2026-08-10');
  expect(past.air).toContain('start_date=2026-08-08'); expect(past.air).not.toContain('past_days');
});
test('firms url takes the two days before', () => {
  expect(firmsUrl('K')).toMatch(/\/2$/);
  expect(firmsUrl('K', '2026-08-09')).toMatch(/\/2\/2026-08-07$/);
});
test('firms area covers Sumatra, Jawa and Kalimantan', () => {
  expect(FIRMS_BBOX).toEqual({ west: 95, south: -9, east: 119.5, north: 6.5 });
  expect(firmsUrl('K')).toContain('/VIIRS_NOAA21_NRT/95,-9,119.5,6.5/2');
});
