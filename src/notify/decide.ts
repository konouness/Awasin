import type { Level } from '@/risk/types';

export function shouldNotify(prev: Level | null, next: Level): boolean {
  return next >= 1 && next > (prev ?? 0);
}
