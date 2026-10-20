import { readFileSync } from 'node:fs';
import { parseOpenMeteo } from '../../src/sources/openMeteo';
import { parseFirmsCsv } from '../../src/sources/firms';
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
