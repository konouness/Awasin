import type { Level } from '@/risk/types';

export type MatchResult = 'cocok' | 'tidak_terdeteksi' | 'tidak_terkonfirmasi';

export const MATCH_LABEL: Record<MatchResult, string> = {
  cocok: 'Cocok',
  tidak_terdeteksi: 'Tidak terdeteksi satelit',
  tidak_terkonfirmasi: 'Belum terkonfirmasi',
};

export function matchReport(observed: Level, predicted: Level): MatchResult {
  if (observed >= 1 && predicted === 0) return 'tidak_terdeteksi';
  if (observed === 0 && predicted >= 2) return 'tidak_terkonfirmasi';
  return 'cocok';
}
