import { buildForecasts, statusFrom } from '../../src/pipeline/buildForecasts';
import type { ForecastRow, HourRow } from '../../src/risk/types';

const NOW = new Date('2026-10-20T03:20:00Z');
const START = Date.parse('2026-10-19T00:00:00Z');
const makeHours = (o: Partial<HourRow> = {}): HourRow[] =>
  Array.from({ length: 72 }, (_, i) => ({
    time: new Date(START + i * 3600_000).toISOString(),
    rainMm: 0, gustKmh: 0, windFromDeg: 0, weatherCode: 0, pm25: 0, ...o,
  }));
const schools2 = [{ id: 'a', lat: 0, lon: 0 }, { id: 'b', lat: 1, lon: 1 }];

test('buildForecasts yields 24h × 3 hazards per school', () => {
  const hourlyFixture = new Map([['a', makeHours()], ['b', makeHours()]]);
  const rows = buildForecasts(schools2, hourlyFixture, [], NOW);
  expect(rows).toHaveLength(2 * 24 * 3);
  expect(rows[0].hour).toBe('2026-10-20T03:00:00.000Z');
});
test('banjir uses trailing 24h rain sum', () => {
  const hourly = new Map([['a', makeHours({ rainMm: 5 })]]);
  const r = buildForecasts([{ id: 'a', lat: 0, lon: 0 }], hourly, [], NOW).find((x) => x.hazard === 'banjir')!;
  expect(r.level).toBe(2); expect(r.score).toBe(120);
});
test('asap counts upwind hotspots per hour', () => {
  const hourly = new Map([['a', makeHours({ windFromDeg: 90 })]]);
  const fires = Array.from({ length: 10 }, () => ({ lat: 0, lon: 0.2 }));
  const r = buildForecasts([{ id: 'a', lat: 0, lon: 0 }], hourly, fires, NOW).find((x) => x.hazard === 'asap')!;
  expect(r.level).toBe(1);
});
test('school with no weather rows is skipped', () => {
  expect(buildForecasts([{ id: 'x', lat: 0, lon: 0 }], new Map(), [], NOW)).toHaveLength(0);
});
test('statusFrom uses max of next 6 hours only', () => {
  const base = Date.parse('2026-10-20T03:00:00Z');
  const rowsWithPeakAtHour7: ForecastRow[] = [];
  for (let i = 0; i < 24; i++) {
    const hour = new Date(base + i * 3600_000).toISOString();
    rowsWithPeakAtHour7.push({ school_id: 'a', hazard: 'asap', hour, level: i === 1 ? 1 : i === 6 ? 3 : 0, score: 0 });
    rowsWithPeakAtHour7.push({ school_id: 'a', hazard: 'banjir', hour, level: 0, score: 0 });
    rowsWithPeakAtHour7.push({ school_id: 'a', hazard: 'angin', hour, level: 0, score: 0 });
  }
  const s = statusFrom(rowsWithPeakAtHour7, 'a', NOW);
  expect(s.levels.asap).toBe(1);
  expect(s.action).toBe('kurangi_luar');
});
