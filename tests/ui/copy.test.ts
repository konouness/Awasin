import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const QUOTED = [
  'Belajar daring', 'Masuk normal', 'Tunda jam masuk', 'Data historis', 'Bukan data hari ini.', 'Langsung', 'Putar ulang: 9 Agu',
  'Apa yang dilakukan sekolah hari ini', 'sekolah di', 'titik panas (48 jam)', 'Memuat peta…', 'Lihat detail sekolah',
  'Masuk', 'Dasbor dinas',
  '24 jam ke depan', 'Dapatkan peringatan', 'Ikuti di Telegram',
  'Draf surat edaran', 'Kabupaten/kota', 'Buat draf surat edaran', 'Menyusun draf…', 'Draf AI, periksa sebelum ditandatangani',
]

test('every string the demo script quotes is still in src', () => {
  const files = (readdirSync('src', { recursive: true }) as string[]).filter((f) => /\.tsx?$/.test(f))
  const all = files.map((f) => readFileSync(join('src', f), 'utf8')).join('\n')
  const missing = QUOTED.filter((s) => !all.includes(s))
  expect(missing, `missing from src: ${missing.join(' | ')}`).toEqual([])
})
