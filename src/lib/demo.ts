const DEMO_SCHOOL = '30202502';

export function demoAccount(role: string): { email: string; dest: string } | null {
  if (role === 'dinas') return { email: 'dinas@awasin.id', dest: '/dinas' };
  if (role === 'sekolah') return { email: `demo+${DEMO_SCHOOL}@awasin.id`, dest: `/sekolah/${DEMO_SCHOOL}` };
  return null;
}
