# Back-test: kabut asap Kalteng, Agustus 2026

Dibuat 1 November 2026 dengan `npx tsx --env-file=.env.local scripts/backtest.mts` lalu `python3 scripts/backtest_chart.py`.

Cara kerja: untuk tiap hari 1–31 Agustus 2026, skor Awasin dihitung ulang pada pukul 06.00 WIB dari arsip Open-Meteo (prakiraan historis dan kualitas udara) dan NASA FIRMS (VIIRS NOAA-21, 48 jam sebelumnya) untuk 25 sekolah contoh. Aturannya sama dengan aplikasi langsung. Data mentah: `backtest.csv`. Tidak ada jam PM2.5 yang kosong di arsip (kolom `pm25_null_hours` = 0 setiap hari).

## Angka kunci

| Tanggal | Awasin (25 sekolah, 06.00 WIB) | Kejadian nyata |
|---|---|---|
| 6 Agu | rekomendasi "Tunda jam masuk" pertama (2 sekolah) | |
| 16 Agu | rekomendasi "Belajar daring" pertama (1 sekolah) | |
| 20 Agu | 13 sekolah daring atau tunda masuk (1 daring, 12 tunda) | PJJ Barito Selatan dimulai (1) |
| 31 Agu | 14 sekolah daring, 5 tunda masuk | SE Gubernur Kalteng: PJJ SMA/SMK/SKh mulai 31 Agustus (2) |

Selisih: Awasin menyarankan daring 4 hari sebelum PJJ Barito Selatan dan 15 hari sebelum SE Gubernur.

Hati-hati saat membaca: sekolah contoh Awasin bukan sekolah yang diatur SE tersebut (SE Gubernur untuk SMA/SMK/SKh, SE Bupati untuk Barito Selatan). Ini perbandingan waktu, bukan perbandingan sekolah per sekolah.

## Sumber kejadian (menunggu persetujuan sebelum masuk grafik)

1. ANTARA Kalteng, "Legislator Barito Selatan apresiasi sekolah kembali gelar pembelajaran tatap muka", 31 Oktober 2026. Menyebut PJJ sejak 20 Agustus hingga 30 Oktober 2026, berdasarkan SE Bupati Barito Selatan Nomor 1970/DISDIK/X/2026. https://kalteng.antaranews.com/berita/848831/legislator-barito-selatan-apresiasi-sekolah-kembali-gelar-pembelajaran-tatap-muka
2. Disdik Provinsi Kalteng, "Kabut Asap Makin Pekat, Gubernur Kalteng Tetapkan PJJ Mulai 31 Agustus 2026", 31 Agustus 2026. SE Gubernur Nomor 400.3.13.1/4747/DISDIK.SET.03/2026, ditetapkan 31 Agustus 2026. https://disdik.kalteng.go.id/berita/kabut-asap-makin-pekat-gubernur-kalteng-tetapkan-pjj-mulai-31-agustus-2026

Angka "571.338 murid PJJ, 11 Agustus 2026" di TODO tidak ditemukan di sumber mana pun yang diperiksa (Wikipedia Karhutla Indonesia 2026, Disdik Kalteng, ANTARA). Jangan dipakai sampai ada sumbernya.

Setelah disetujui, tambahkan garis SE ke grafik:

```
python3 scripts/backtest_chart.py 2026-08-20 "PJJ Barito Selatan" 2026-08-31 "SE Gubernur: PJJ"
```
