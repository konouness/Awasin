import { shouldNotify } from '../../src/notify/decide';
import { parseStartCommand, alertText, commandOf } from '../../src/notify/telegram';
test('notify only when level rises to ≥1', () => {
  expect(shouldNotify(null, 0)).toBe(false); expect(shouldNotify(null, 1)).toBe(true);
  expect(shouldNotify(2, 2)).toBe(false); expect(shouldNotify(2, 3)).toBe(true); expect(shouldNotify(3, 1)).toBe(false);
});
test('parseStartCommand', () => {
  expect(parseStartCommand('/start 30201234')).toBe('30201234');
  expect(parseStartCommand('/start')).toBeNull(); expect(parseStartCommand('halo')).toBeNull();
});
test('alertText names school, hazard, level, action and link', () => {
  const t = alertText('SDN 1 Pahandut', '30203558', 'asap', 3, 'daring', 'https://x.app');
  expect(t.startsWith('⚠️ Sekitar SDN 1 Pahandut:')).toBe(true); expect(t).toContain('Asap / polusi udara level 3');
  expect(t).toContain('Belajar dan bekerja dari rumah'); expect(t).toContain('https://x.app/sekolah/30203558');
});
test('commandOf', () => {
  expect(commandOf('/unfollow')).toBe('unfollow');
  expect(commandOf('/Unfollow@AwasinBot')).toBe('unfollow');
  expect(commandOf('/start 30201234')).toBe('start');
  expect(commandOf('halo')).toBeNull();
  expect(commandOf('/unfollowme')).toBe('unfollowme');
});
