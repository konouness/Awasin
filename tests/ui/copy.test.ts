import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const QUOTED = [
  'Dapatkan peringatan', 'Ikuti di Telegram', 'Terdaftar untuk sekitar', 'Kami kirim pesan saat risiko naik.',
  'Putar ulang: 9 Agu', 'Data historis: kondisi', 'Bukan data hari ini.', 'Apa yang sebaiknya dilakukan hari ini', 'lokasi sekolah di',
  'Beraktivitas normal', 'Kurangi kegiatan luar ruang', 'Tunda bepergian', 'Belajar dan bekerja dari rumah', 'Lihat detail sekolah',
  'Rekomendasi untuk warga, siswa, dan pekerja di sekitar sekolah ini.', 'Asap / polusi udara', 'dalam 6 jam ke depan',
  'Naik satu level: ada 10 titik panas atau lebih dalam 50 km di arah datangnya angin.', '24 jam ke depan', 'Ambang: ISPU KLHK',
  'Dasbor dinas', 'Draf surat edaran', 'Kabupaten/kota', 'Buat draf surat edaran', 'Menyusun draf…', 'Draf AI, periksa sebelum ditandatangani',
]

test('every string the demo script quotes is still in src', () => {
  const files = (readdirSync('src', { recursive: true }) as string[]).filter((f) => /\.tsx?$/.test(f))
  const all = files.map((f) => readFileSync(join('src', f), 'utf8')).join('\n')
  const missing = QUOTED.filter((s) => !all.includes(s))
  expect(missing, `missing from src: ${missing.join(' | ')}`).toEqual([])
})
