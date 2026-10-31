import { demoAccount, isDemoSchool } from '../../src/lib/demo';
beforeEach(() => { process.env.DEMO_LOGIN = '1'; });
test('demo roles map to the seeded accounts', () => {
  expect(demoAccount('dinas')).toEqual({ email: 'dinas@awasin.id', dest: '/dinas' });
  expect(demoAccount('sekolah')).toEqual({ email: 'demo+30202502@awasin.id', dest: '/sekolah/30202502' });
});
test('anything else is refused', () => {
  expect(demoAccount('admin')).toBeNull(); expect(demoAccount('')).toBeNull();
});
test('demo login is off unless DEMO_LOGIN=1', () => {
  delete process.env.DEMO_LOGIN;
  expect(demoAccount('dinas')).toBeNull();
  process.env.DEMO_LOGIN = '1';
  expect(demoAccount('dinas')).not.toBeNull();
});
test('the demo school does not broadcast to Telegram', () => {
  expect(isDemoSchool('30202502')).toBe(true);
  expect(isDemoSchool('30203587')).toBe(false);
});
