import { demoAccount } from '../../src/lib/demo';
test('demo roles map to the seeded accounts', () => {
  expect(demoAccount('dinas')).toEqual({ email: 'dinas@awasin.id', dest: '/dinas' });
  expect(demoAccount('sekolah')).toEqual({ email: 'demo+30202502@awasin.id', dest: '/sekolah/30202502' });
});
test('anything else is refused', () => {
  expect(demoAccount('admin')).toBeNull(); expect(demoAccount('')).toBeNull();
});
