const DEMO_SCHOOL = '30202502';

export const demoEnabled = () => process.env.DEMO_LOGIN === '1';

export const isDemoSchool = (npsn: string) => npsn === DEMO_SCHOOL;

export function demoAccount(role: string): { email: string; dest: string } | null {
  if (!demoEnabled()) return null;
  if (role === 'dinas') return { email: 'dinas@awasin.id', dest: '/dinas' };
  if (role === 'sekolah') return { email: `demo+${DEMO_SCHOOL}@awasin.id`, dest: `/sekolah/${DEMO_SCHOOL}` };
  return null;
}
