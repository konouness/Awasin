import type { Hazard } from '@/risk/types';

export const HAZARD_ADVICE: Record<Hazard, string> = {
  asap: 'Pakai masker saat di luar. Tutup jendela dan batasi kegiatan di luar.',
  banjir: 'Pindahkan barang ke tempat tinggi dan pastikan jalur pulang aman.',
  angin: 'Jauhi pohon dan papan reklame. Tunda olahraga dan acara di lapangan terbuka.',
};

export const SCORE_UNIT: Record<Hazard, string> = { asap: 'µg/m³ PM2.5', banjir: 'mm hujan 24 jam', angin: 'km/jam hembusan' };

export const THRESHOLD_SOURCE: Record<Hazard, string> = {
  asap: 'Ambang: ISPU KLHK (PermenLHK P.14/2020)',
  banjir: 'Kategori hujan: BMKG',
  angin: 'Ambang: skala Beaufort',
};
