import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const QUOTED = [
  'Belajar daring', 'Masuk normal', 'Tunda jam masuk', 'Data historis', 'Bukan data hari ini.', 'Langsung', 'Putar ulang: 9 Agu',
  'Apa yang dilakukan sekolah hari ini', 'sekolah di', 'titik panas (48 jam)', 'Memuat peta…', 'Lihat detail sekolah',
  'Masuk', 'Keluar', 'Sekolah saya', 'Kirim laporan', 'Dasbor dinas', 'Masuk sebagai Sekolah', 'Masuk sebagai Dinas Pendidikan',
  'Laporan lapangan', 'Jarak pandang (meter)', 'Tercium bau asap', 'Siswa sakit atau terdampak hari ini', 'Foto (opsional)',
  'Mengirim…', 'Laporan terkirim ke dinas.', 'Mode darurat', 'Aktifkan mode daring', 'Mode daring aktif', 'Akhiri mode daring',
  'absen kesehatan', 'Absen kesehatan', 'Nama siswa', 'Kelas', 'Kondisi hari ini', 'Kirim absen',
  '24 jam ke depan', 'Dapatkan peringatan', 'Ikuti di Telegram', 'Laporan lapangan terbaru', 'Hanya yang tidak terdeteksi satelit',
  'Draf surat edaran', 'Kabupaten/kota', 'Buat draf surat edaran', 'Menyusun draf…', 'Draf AI, periksa sebelum ditandatangani',
]

test('every string the demo script quotes is still in src', () => {
  const files = (readdirSync('src', { recursive: true }) as string[]).filter((f) => /\.tsx?$/.test(f))
  const all = files.map((f) => readFileSync(join('src', f), 'utf8')).join('\n')
  const missing = QUOTED.filter((s) => !all.includes(s))
  expect(missing, `missing from src: ${missing.join(' | ')}`).toEqual([])
})
