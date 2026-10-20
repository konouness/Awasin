import type { Action, Level } from '@/risk/types';

export function shouldNotify(prev: Level | null, next: Level): boolean {
  return next >= 1 && next > (prev ?? 0);
}

export function shouldActivateEmergency(action: Action, hasActive: boolean): boolean {
  return action === 'daring' && !hasActive;
}
