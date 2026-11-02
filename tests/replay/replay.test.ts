import { REPLAY_DAYS, replayDay } from '../../src/replay/replay';
test('unknown or empty day falls back to live', () => {
  expect(replayDay(undefined)).toBeNull(); expect(replayDay('')).toBeNull(); expect(replayDay('2026-13-99')).toBeNull();
});
test('baked days load and are 06.00 WIB', () => {
  for (const d of REPLAY_DAYS) { const s = replayDay(d)!; expect(s.at).toBe(new Date(`${d}T06:00:00+07:00`).toISOString()); expect(Object.keys(s.schools).length).toBeGreaterThanOrEqual(20); }
});
test('the haze shows up on 9 Aug', () => {
  const s = replayDay('2026-08-09')!;
  expect(Object.values(s.schools).some((x) => x.status.action !== 'normal')).toBe(true);
});
