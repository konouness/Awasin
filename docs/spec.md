# Spec: Awasin — Sistem Peringatan & Tanggap Bencana untuk Sekolah

ADIKARA 2026 · Divisi Inovasi · Subdivisi Software. Diputuskan 2026-10-20.
Sumber aturan lomba: `/Users/konou/VSCode/LockedIn/K Project/GuideBook Adikara 2026.pdf` (hlm. 12–16).

## Ringkasan (gaya proposal)

Aplikasi peringatan dan tanggap darurat bencana berbasis web yang membantu sekolah
dan dinas pendidikan mengambil keputusan sebelum dan saat bencana mengancam,
khususnya kabut asap karhutla, banjir dan hujan ekstrem, serta cuaca ekstrem dan
angin kencang. Aplikasi mengolah data satelit dan prakiraan cuaca (titik panas,
kualitas udara, curah hujan, kecepatan angin) menjadi status risiko tiap sekolah
untuk 6–24 jam ke depan, lalu memberi rekomendasi otomatis kepada kepala sekolah:
masuk normal, tunda jam masuk, pulangkan lebih awal, wajib masker, atau belajar
daring. Guru dan petugas UKS mengirim laporan lapangan (foto, jarak pandang, tinggi
genangan, jumlah siswa terdampak) yang dicocokkan dengan prediksi pada dashboard
dinas. Saat sekolah beralih ke belajar daring, aplikasi mengirim pengumuman lewat
Telegram dan mencatat absen kesehatan harian siswa.

## Modul

- **S5 Prediksi risiko**: 3 bencana (asap, banjir/hujan ekstrem, angin/cuaca ekstrem),
  level 0–3 per jam untuk 24 jam, rekomendasi per sekolah, notifikasi saat level naik.
  Angin paling tinggi "tunda jam masuk" (tidak pernah daring). Sumber ambang tampil di
  halaman sekolah (`docs/sources.md`). Mode putar ulang `?putar=` menampilkan kondisi
  06.00 WIB pada 9, 10, 11 Agustus 2026 dengan banner "Data historis"; back-test
  Agustus 2026 ada di `docs/backtest/`.
- **S6 Laporan lapangan**: form 30 detik untuk akun sekolah, foto dikompres di
  browser; dashboard dinas menandai laporan `cocok` / `tidak_terdeteksi` /
  `tidak_terkonfirmasi` terhadap prediksi. Dinas bisa membuat draf surat edaran per
  kabupaten dengan Gemini; yang dikirim hanya angka total, hasilnya berlabel "Draf AI,
  periksa sebelum ditandatangani".
- **S7 Mode darurat**: aktif otomatis saat rekomendasi = daring (sekolah bisa
  mengakhiri), pengumuman Telegram, absen kesehatan
  harian publik per sekolah. Nama siswa hanya terlihat oleh sekolahnya sendiri; dinas
  melihat jumlahnya saja.

## Batasan

- Repo `konouness/Awasin` private sampai awarding 22 Nov 2026. Vercel Hobby hanya mem-build push dari akun konouness, jadi push teman setim perlu diikuti push dari akun itu.
- Rp 0 dan tanpa kartu kredit: Vercel Hobby, Supabase Free, NASA FIRMS (MAP_KEY),
  Open-Meteo (non-komersial, tanpa key), bot Telegram, Gemini API tier gratis.
- Vercel Hobby cron hanya 1×/hari, jadi refresh per jam memakai pg_cron + pg_net di Supabase.
- Wilayah prototipe: 21 provinsi di Kalimantan, Jawa, dan Sumatra, 85 sekolah sebagai titik acuan. Back-test tetap 25 sekolah Kalteng.
- Keputusan 2026-10-31 (menggantikan "tidak ada fitur yang dipotong" 2026-10-20): papan
  tugas dan web push dipotong, angin dibatasi di "tunda jam masuk". Kedua kolom sakit dan
  semua lencana jenjang tetap. Cek foto dengan Gemini dan tombol WhatsApp tidak dibuat.
- Keputusan 2026-11-01: login demo satu klik per peran (Sekolah / Dinas) untuk juri.
- Keputusan 2026-11-04 (menggantikan S6, mode darurat, absen kesehatan, dan login 2026-11-01): tanpa login sama sekali.
  Laporan lapangan, pencocokan laporan, absen kesehatan, dan mode daring otomatis dihapus. Dasbor dinas dan draf
  surat edaran terbuka untuk umum. Lima rekomendasi ditulis untuk semua warga: beraktivitas normal, kurangi kegiatan
  luar ruang, tunda bepergian, pulang lebih awal, belajar dan bekerja dari rumah.
- Deadline penyisihan: 8 November 2026 (diperpanjang dari 31 Oktober 23:59 WIB). Tim 3 orang (A backend/data,
  B frontend, C proposal/video).
- SDG 3, 4, 11 · Asta Cita 4. Jangan jadikan SDG 13/15 sebagai SDG utama.

## Rubrik penyisihan (yang menentukan prioritas)

Format 5% · Urgensi 25% · Kreativitas 30% · Hasil karya 40% (produk 20% + video demo 20%).
