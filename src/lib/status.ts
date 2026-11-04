import type { Action, Hazard, Level } from '@/risk/types';

export const ACTION_LABEL: Record<Action, string> = {
  normal: 'Beraktivitas normal',
  kurangi_luar: 'Kurangi kegiatan luar ruang',
  tunda_masuk: 'Tunda bepergian',
  pulang_awal: 'Pulang lebih awal',
  daring: 'Belajar dan bekerja dari rumah',
};

export const HAZARD_LABEL: Record<Hazard, string> = {
  asap: 'Asap / polusi udara',
  banjir: 'Banjir / hujan ekstrem',
  angin: 'Angin / cuaca ekstrem',
};

export const LEVEL_COLOR: Record<Level, string> = { 0: '#2e7d32', 1: '#f9a825', 2: '#ef6c00', 3: '#c62828' };

export const LEVEL_LABEL: Record<Level, string> = { 0: 'Aman', 1: 'Waspada', 2: 'Siaga', 3: 'Awas' };
