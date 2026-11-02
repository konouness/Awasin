# Back-test: kabut asap Kalteng, Agustus 2026

Dibuat 1 November 2026 dengan `npx tsx --env-file=.env.local scripts/backtest.mts` lalu `python3 scripts/backtest_chart.py`.

Cara kerja: untuk tiap hari 1–31 Agustus 2026, skor Awasin dihitung ulang pada pukul 06.00 WIB dari arsip Open-Meteo (prakiraan historis dan kualitas udara) dan NASA FIRMS (VIIRS NOAA-21, 48 jam sebelumnya) untuk 25 sekolah contoh. Aturannya sama dengan aplikasi langsung. Data mentah: `backtest.csv`. Tidak ada jam PM2.5 yang kosong di arsip (kolom `pm25_null_hours` = 0 setiap hari).

## Angka kunci

Dihitung ulang 1 November 2026 setelah asap mengikuti SE Mendikdasmen 20/2026 (ISPU 101–200 tunda masuk, di atas 200 daring).

| Tanggal | Awasin (25 sekolah, 06.00 WIB) | Kejadian nyata |
|---|---|---|
| 1 Agu | rekomendasi "Tunda jam masuk" pertama (4 sekolah) | |
| 6 Agu | rekomendasi "Belajar daring" pertama (2 sekolah) | |
| 17 Agu | 10 sekolah daring, 9 tunda masuk | |
| 20 Agu | 13 sekolah daring, 11 tunda masuk | PJJ Barito Selatan dimulai (1) |
| 31 Agu | 19 sekolah daring, 6 tunda masuk | SE Gubernur Kalteng: PJJ SMA/SMK/SKh mulai 31 Agustus (2) |

Selisih: sejak 17 Agustus Awasin menyarankan daring untuk 10 sekolah atau lebih, 3 hari sebelum PJJ Barito Selatan dan 14 hari sebelum SE Gubernur.

Hati-hati saat membaca: sekolah contoh Awasin bukan sekolah yang diatur SE tersebut (SE Gubernur untuk SMA/SMK/SKh, SE Bupati untuk Barito Selatan). Ini perbandingan waktu, bukan perbandingan sekolah per sekolah.

## Sumber kejadian (disetujui 1 November 2026, sudah di grafik)

1. ANTARA Kalteng, "Legislator Barito Selatan apresiasi sekolah kembali gelar pembelajaran tatap muka", 31 Oktober 2026. Menyebut PJJ sejak 20 Agustus hingga 30 Oktober 2026, berdasarkan SE Bupati Barito Selatan Nomor 1970/DISDIK/X/2026. https://kalteng.antaranews.com/berita/848831/legislator-barito-selatan-apresiasi-sekolah-kembali-gelar-pembelajaran-tatap-muka
2. Disdik Provinsi Kalteng, "Kabut Asap Makin Pekat, Gubernur Kalteng Tetapkan PJJ Mulai 31 Agustus 2026", 31 Agustus 2026. SE Gubernur Nomor 400.3.13.1/4747/DISDIK.SET.03/2026, ditetapkan 31 Agustus 2026. https://disdik.kalteng.go.id/berita/kabut-asap-makin-pekat-gubernur-kalteng-tetapkan-pjj-mulai-31-agustus-2026

Angka "571.338 murid PJJ, 11 Agustus 2026" di TODO tidak ditemukan di sumber mana pun yang diperiksa (Wikipedia Karhutla Indonesia 2026, Disdik Kalteng, ANTARA). Jangan dipakai sampai ada sumbernya.

Grafik dibuat dengan:

```
python3 scripts/backtest_chart.py 2026-08-20 "PJJ Barito Selatan" 2026-08-31 "SE Gubernur: PJJ"
```
