import type { Hazard } from '@/risk/types';

export const HAZARD_ADVICE: Record<Hazard, string> = {
  asap: 'Wajib masker. Tutup jendela kelas dan batasi kegiatan di luar.',
  banjir: 'Pindahkan barang ke tempat tinggi dan pastikan jalur pulang siswa aman.',
  angin: 'Jauhi pohon dan papan reklame. Tunda upacara dan olahraga di lapangan.',
};

export const SCORE_UNIT: Record<Hazard, string> = { asap: 'µg/m³ PM2.5', banjir: 'mm hujan 24 jam', angin: 'km/jam hembusan' };
