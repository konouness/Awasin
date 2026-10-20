import { isStale, todayWIB, formatWIB } from '../../src/lib/time';
test('isStale after 2 hours', () => {
  const now = new Date('2026-10-20T10:00:00Z');
  expect(isStale('2026-10-20T08:30:00Z', now)).toBe(false);
  expect(isStale('2026-10-20T07:59:00Z', now)).toBe(true);
  expect(isStale(null, now)).toBe(true);
});
test('todayWIB crosses midnight correctly', () => {
  expect(todayWIB(new Date('2026-10-20T23:30:00Z'))).toBe('2026-10-21');
  expect(todayWIB(new Date('2026-10-20T16:59:00Z'))).toBe('2026-10-20');
});
test('formatWIB shows local hour', () => { expect(formatWIB('2026-10-20T07:00:00Z')).toBe('20 Okt 14.00 WIB'); });
