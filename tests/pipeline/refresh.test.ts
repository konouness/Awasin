import { vi } from 'vitest';
import { refresh, type RefreshDeps } from '../../src/pipeline/refresh';
import type { HourRow } from '../../src/risk/types';

const NOW = new Date('2026-10-20T03:20:00Z');
const START = Date.parse('2026-10-19T00:00:00Z');
const hours = (): HourRow[] =>
  Array.from({ length: 72 }, (_, i) => ({ time: new Date(START + i * 3600_000).toISOString(), rainMm: 0, gustKmh: 0, windFromDeg: 0, weatherCode: 0, pm25: 0 }));

function fakeDeps(o: Partial<RefreshDeps> = {}) {
  return {
    loadSchools: vi.fn(async () => [{ id: 'a', lat: 0, lon: 0 }]),
    fetchOpenMeteo: vi.fn(async () => new Map([['a', hours()]])),
    fetchHotspots: vi.fn(async () => []),
    saveHotspots: vi.fn(async () => {}),
    saveForecasts: vi.fn(async () => {}),
    saveStatus: vi.fn(async () => {}),
    logRun: vi.fn(async () => {}),
    afterStatus: vi.fn(async () => {}),
    ...o,
  };
}

test('refresh keeps previous forecasts when a source fails', async () => {
  const deps = fakeDeps({ fetchHotspots: () => Promise.reject(new Error('FIRMS 503')) });
  const res = await refresh(deps, NOW);
  expect(res.ok).toBe(false);
  expect(deps.saveForecasts).not.toHaveBeenCalled();
  expect(deps.saveStatus).not.toHaveBeenCalled();
  expect(deps.logRun).toHaveBeenCalledWith(false, 'FIRMS 503');
});
test('refresh saves forecasts and status then runs afterStatus', async () => {
  const deps = fakeDeps();
  const res = await refresh(deps, NOW);
  expect(res).toEqual({ ok: true, schools: 1 });
  expect(vi.mocked(deps.saveForecasts).mock.calls[0][0]).toHaveLength(72);
  expect(vi.mocked(deps.saveStatus).mock.calls[0][0][0]).toMatchObject({ school_id: 'a', action: 'normal', hazard: null });
  expect(deps.saveHotspots).toHaveBeenCalledWith([]);
  expect(deps.afterStatus).toHaveBeenCalledTimes(1);
  expect(deps.logRun).toHaveBeenCalledWith(true, undefined);
});
test('a failing afterStatus is logged but forecasts stay saved', async () => {
  const deps = fakeDeps({ afterStatus: () => Promise.reject(new Error('telegram down')) });
  const res = await refresh(deps, NOW);
  expect(deps.saveForecasts).toHaveBeenCalled();
  expect(res.ok).toBe(true);
  expect(deps.logRun).toHaveBeenCalledWith(true, 'notifikasi: telegram down');
});
test('a failed hotspot save does not block the status refresh', async () => {
  const deps = fakeDeps({ saveHotspots: () => Promise.reject(new Error('hotspots 413')) });
  const res = await refresh(deps, NOW);
  expect(res.ok).toBe(true);
  expect(deps.saveStatus).toHaveBeenCalledTimes(1);
});
test('refresh saves only hotspots near a school for the live map', async () => {
  const near = { lat: 0.5, lon: 0.5 };
  const far = { lat: 5, lon: 5 };
  const deps = fakeDeps({ fetchHotspots: vi.fn(async () => [near, far]) });
  await refresh(deps, NOW);
  expect(deps.saveHotspots).toHaveBeenCalledWith([near]);
});
