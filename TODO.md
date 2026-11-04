# Awasin TODO

> **Where we left off (3 Nov 2026):** The multi-provinsi plan is built, applied to production (migration + seed), re-baked with every FIRMS fire (no distance limit; 9 Aug: 5.992 titik api), and pushed to `main`. Vercel has `GEMINI_API_KEY`, `DEMO_PASSWORD`, and `DEMO_LOGIN=1`. Waiting on you: retake the BAB 7.1 map screenshot, fill the proposal placeholders, and record the video. The proposal is at the 30-page limit. The "571.338 murid, 11 Agustus" number has no source; do not use it.

Submit by: **8 Nov 2026**. Finalists: 11 Nov. Final: 19 Nov. Awarding: 22 Nov.

Owner tags: **[Claude]** builds or researches it, **[You]** decides, uses your accounts, or does it in the real world, **[Both]** Claude prepares, you finish or approve.

If time runs short, do these three first: **#1 + #2 (replay + back-test)**, **video**, **#3 (threshold sources)**.

---

## Decisions first

- [x] **[You]** Get the team's OK on the cuts in #4. This reverses the 20 Oct "no features cut" decision.
- [x] **[You]** Pick the replay day for #1 (e.g. a Sept 2023 or Aug 2026 haze day in Kalteng). Claude can suggest one once the data check in #1 is done.

## 1. Replay mode

Judging is in rainy season, so the live map will likely show every school as "Masuk normal". Replay keeps the product looking alive.

- [x] **[Claude]** Check how far back the Open-Meteo air-quality archive and the FIRMS archive go for Kalteng.
- [x] **[Claude]** Load one real haze day into the app and add a "Putar ulang: <tanggal>" switch on the map and school pages.
- [x] **[Claude]** Show a clear "Data historis" banner whenever replay is on, so nobody mistakes it for live data.
- [ ] **[You]** Try it on your phone and check the story reads correctly.

## 2. Back-test chart

Shows the prediction against a real event: "Awasin would have said tunda masuk on day X, the SE came on day Y."

- [x] **[Claude]** Run the scoring over the replay period and produce the chart (PNG) plus the key numbers.
- [x] **[Both]** (approved 1 Nov, on the chart) Find the real SE or closure date for that event from a news source (2021 or newer). Claude found two (Barito Selatan PJJ 20 Aug, SE Gubernur 31 Aug) in `docs/backtest/README.md`; you approve before they go on the chart.
- [ ] **[You]** Put the chart in the video. (Already in the proposal, Gambar 5.)

## 3. Threshold sources

- [x] **[Claude]** Verify the haze cutoffs (55.5 / 150.5 / 250.5 µg/m³) against the ISPU PM2.5 categories in PermenLHK P.14/2020.
- [x] **[Claude]** Verify the rain cutoffs (50 / 100 / 150 mm per day) against BMKG's rain categories.
- [x] **[Claude]** Show "Ambang: ISPU KLHK" and "Kategori hujan: BMKG" on the school page.
- [x] **[Both]** Do not cite the 2015 Kemendikbud SE (older than the 2020 source floor). Look for the updated 2026 Kemendikdasmen SE. If only the 2015 one exists, ask before using it. Found: SE Mendikdasmen 20/2026 (see `docs/sources.md`).
- [x] **[You]** Decided 1 Nov: follow SE 20/2026 (daring above ISPU 200). Was: ISPU uses a 24-hour average but Awasin scores hourly values, and SE 20/2026 orders full PJJ at ISPU above 200 while Awasin says daring only above 300. `score.ts` is unchanged until you choose.

## 4. Cuts (after the team OK)

- [x] **[Claude]** Hide the task board (`src/app/s/[npsn]/tugas/`) and remove its links from the announcement text and the emergency panel.
- [x] **[Claude]** Remove the unused `web-push` package, the VAPID keys in `.env.example`, and the web-push lines in `docs/spec.md`.
- [x] ~~**[Claude]** Remove the "Perguruan tinggi" badge, or all jenjang badges.~~ Kept (decision 31 Oct).
- [x] ~~**[Claude]** Merge "Sakit (laporan)" and "Sakit (absen)" on the Dinas dashboard into one column.~~ Kept (decision 31 Oct).
- [x] **[Claude]** Cap wind at "tunda masuk" / "pulang awal" (no "daring" for wind) in `src/risk/score.ts`, and update its test.

## 5. Gemini photo check on field reports (out, decision 31 Oct)

- [ ] **[You]** Create a Gemini API key in Google AI Studio and add `GEMINI_API_KEY` to Vercel.
- [ ] **[Claude]** After a report with a photo comes in, ask Gemini on the server which hazard the photo shows, a rough level, and whether it matches the typed numbers. Save the result to the report.
- [ ] **[Claude]** Show "Foto: …, sesuai / tidak sesuai" on the Dinas dashboard.
- [ ] **[Claude]** If the quota runs out or the call fails, show "analisis AI tidak tersedia". The report still goes through.
- [ ] **[Claude]** Send only the photo, never student names or check-in data. Add a note on the form: do not photograph students' faces.

## 6. "Bagikan ke WhatsApp" button (out, decision 31 Oct)

- [ ] **[Claude]** Add a `wa.me/?text=` share link with the alert or announcement already filled in.

## 7. Health check-in privacy

- [x] **[Claude]** Show student names only to their own school. Dinas sees totals only.
- [x] **[Claude]** Add a test for this to `supabase/tests/rls.sql`.

## 8. Optional: "Buat draf surat edaran" for Dinas

- [x] **[Claude]** Add a button that sends the day's totals (no personal data) to Gemini and returns a formal SE draft per kabupaten.
- [x] **[Claude]** Label it "Draf AI, periksa sebelum ditandatangani".

## 9. Multi-provinsi and a sharper story (decision 1 Nov, scope changed 2 Nov)

The prototype grows to all of Kalimantan, Jawa, and Sulawesi (17 provinces, 73 schools). Sumatra is not in the prototype. National coverage and ASEAN go in the proposal as the roadmap only. The back-test stays 25 Kalteng schools.

### Code
- [x] **[Claude]** (done 2 Nov; replay 9 Aug: 73 sekolah, 29 normal / 6 kurangi luar / 30 tunda / 8 daring; Kalteng unchanged at 8 / 12 / 5) Run `docs/superpowers/plans/2026-11-01-awasin-multi-provinsi.md` (FIRMS area, `provinsi` column, 48 real Dapodik schools, map fits schools, replay re-bake).
- [x] **[You]** (db push + seed done 2 Nov: 73 schools, 17 provinces; pushed 3 Nov) OK the production `db push` + seed in Task 4 of that plan, then push from konouness.

### Proposal
- [x] **[Claude]** (done 2 Nov, BAB 6.4 + Tabel 11) New section "Skalabilitas" (BAB 6, after 6.3 Biaya operasional):
  - Phase 1, now: Kalimantan, Jawa, Sulawesi (17 provinces, 73 schools), Rp 0.
  - Phase 2, national: a Dapodik import plus scoring per grid cell rather than per school, so cost grows with area rather than school count. Name the paid Open-Meteo plan as the only new cost.
  - Phase 3, ASEAN: each country's index and school rule plugged into the same engine. The ASEAN Agreement on Transboundary Haze Pollution is the reason.

  Sources must be 2021 or newer.
- [x] **[Claude]** (done 2 Nov, Tabel 1 in 1.3) Table "Kenapa bukan ISPUNet / IQAir?" (BAB 1.3 or 5):
  - SE 20/2026 decides by daily ISPU for a whole kabupaten. Awasin decides per school.
  - Those apps show the air now. Awasin forecasts 6 hours ahead.
  - They give a number. Awasin gives a decision that follows the rules.
  - Third-party apps show AQI, not ISPU.
- [x] **[Claude]** (done 2 Nov, 1.2 + 6.2; source used: detikKalimantan + pontianak.go.id, 27 Sep 2026, Disdikbud edaran B/400.7.15.5/1166/DISDIKBUD/2026) Reframe field reports + health check-in as the record schools are already asked to keep: ISPU checks, learning mode, health of students and staff. Source: Pontianak, InfoPublik Sept 2026.
- [x] **[Claude]** (done 2 Nov) Put haze first everywhere. Flood: one paragraph. Wind: one line under "dapat diperluas". AI SE draft: one short paragraph, not a headline feature.
- [x] **[Claude]** (done 2 Nov; back-test is now 6.5) Update every "25 sekolah" / "Kalimantan Tengah" scope line (abstract, 3.1, 6.5, BAB 7). Keep "25 sekolah" only for the back-test in 6.4.
- [x] **[Claude]** (done 2 Nov) Back-test: add one sentence on why the first "daring" calls came on 6 Aug. **Correction:** it was not ISPU above 200. Peak PM2.5 was 67.3 / 61.2 µg/m³ (ISPU 101–200) at SDN 1 Damparan and SDN 1 Mengkatip; the 10+ upwind fires rule lifted them to daring. The proposal says so.
- [ ] **[You]** Retake the map screenshot (BAB 7.1) after the re-bake, showing Kalimantan, Jawa, and Sulawesi.
- [ ] **[You]** Rewrite the new sections in your own words before submitting.

### Video
- [ ] **[You]** Record from `../Proposal/TUTORIAL_VIDEO_DEMO.md` (updated 2 Nov for Kalimantan, Jawa, Sulawesi; section 4 is the click guide, section 5 the read-aloud script).

---

## Gaps found (not done yet)

### Code and deploy
- [x] **[Claude]** Commit the SE 20/2026 rule change (`score.ts`, its tests, `docs/backtest/*`, `docs/sources.md`, `src/replay/data.json`) as its own commit. It is Task 0 of the multi-provinsi plan. Production keeps the old rule until it is pushed.
- [ ] **[Both]** Commit the uncommitted hotspot-map work (committed and its migration applied; the push is still yours) (`Map.tsx`, `MapLoader.tsx`, `page.tsx`, `globals.css`, `pipeline/deps.ts`, `pipeline/refresh.ts`, its test). Push from the **konouness** account so Vercel builds it.
- [x] **[Claude]** README is only a title. Write setup steps (env, `db push`, seed, Vault secrets, set-webhook), data attribution, and the demo accounts for judges. Put no password in git.
- [x] **[Claude]** Update `docs/spec.md` and the plan to match the cuts, Gemini, and replay. Tick the plan steps that are already done (Tasks 1–9).
- [x] **[Claude]** Drop the PWA part of plan Task 10. It only existed for web push, which is cut.
- [x] **[Claude]** Replay mode (#1) replaces the plan's `scripts/demo-scenario.sql`.

### Before submitting
- [ ] **[You]** Full end-to-end check on production with a phone: map, school page, login as school, send a report with a photo, Dinas dashboard, Telegram subscribe and alert, emergency mode, health check-in. Claude can write the checklist.
- [ ] **[You]** Check the hourly refresh is running (`cron.job_run_details` shows `succeeded`). Otherwise judges see the "Data belum diperbarui" banner.
- [ ] **[You]** Make sure the Supabase Free project will not pause from inactivity between 1 and 22 Nov.
- [ ] **[You]** Check the Telegram webhook points at the production URL.
- [ ] **[You]** Check that the demo accounts (one school, one Dinas) log in on production with the one-click buttons on `/login` (needs `DEMO_PASSWORD` in Vercel). Put them and the password in the proposal.
- [ ] **[You]** Check the ADIKARA website for the Inovasi submission rules the guidebook leaves out: video length and file name, and how to submit the product (link, repo access). The repo stays private until 22 Nov.

### Proposal (owner C)
- [ ] **[You]** Fill the `[TAUTAN VIDEO]` (now Tabel 13) placeholder (email done 2 Nov), then `sh build/ekspor.sh`.
- [x] **[Claude]** (done 2 Nov) Change the title and every scope line from "Kalimantan Tengah" to Kalimantan, Jawa, Sulawesi (part of #9).
- [x] Drafted 1 Nov: `../Proposal/PENYISIHAN_PROPOSAL_ADIKARA2026_INOVASI_SOFTWARE_TAKHUNTER.pdf` (26 pages, 1.1 MB), built by `../Proposal/build/ekspor.sh`. Still open: team lead email and video link placeholders, rewrite in your own words, retake the Dinas screenshot after the push.
- [x] Dropped 1 Nov. Opening numbers: 3.524 sekolah, 571.338 murid PJJ karena asap (11 Agustus 2026). **No source found for these (checked 1 Nov); find one or drop them.** Kalteng's province-wide PJJ started 31 Aug (SE Gubernur).
- [ ] Repeat the three lines: "BMKG memberi tahu cuacanya, Awasin memberi tahu tindakannya" · "Melengkapi data BMKG, KLHK, BNPB" · "Aturan yang memutuskan, AI yang memeriksa, manusia yang menandatangani".
- [ ] Add the back-test chart, a Rp 0 running-cost table, and the threshold sources.
- [ ] Format: max 30 pages in total, A4, margins 4/3/3/3 cm, Times New Roman 12, justified, Harvard references, cover with team info, university, and team lead email, Software Development structure.
- [ ] State SDG 3, 4, 11 and Asta Cita 4. Do not make SDG 13 or 15 the main SDG.
- [ ] Every reference from 2021 or newer, with 2020 as the absolute floor.
- [ ] PDF metadata: real author and real dates. File under 10 MB.
- [ ] File name: `PENYISIHAN_PROPOSAL_ADIKARA2026_INOVASI_SOFTWARE_<NAMA_TIM>`.

### Video (owner C)
- [ ] Tell one story, not a feature tour: 05.30 haze, principal sees "Tunda jam masuk"; teacher report with photo; Dinas dashboard and the AI surat edaran draft; end on the back-test chart.
- [ ] Record in replay mode so every screen shows real data.
- [ ] Keep it under 3 minutes unless the website says otherwise. MP4, 720p or higher.

### Team (Alfi and Fino)

Small tasks, but each one is real and their own. About an hour each before submitting.

- [ ] **Alfi:** run the phone end-to-end check on production (the checklist under "Before submitting"), and join the Telegram bot and screen-record the alert for the video.
- [ ] **Fino:** check the proposal format (A4, margins 4/3/3/3, Times New Roman 12, justified, max 30 pages, Harvard references), and narrate the 0:00–0:35 part of the video (team intro and problem).
- [ ] **Both:** read the final proposal and OK what is written under their names before you submit.
- [ ] **Both (finalists only):** be able to explain how one recommendation is calculated (threshold → level → action).

### Final round prep (after 11 Nov, if you are a finalist)
- [ ] **[Both]** Slides for 7 minutes of presentation and demo.
- [ ] **[Both]** Q&A bank: where the thresholds come from, accuracy (back-test), fake reports (photo check), why not just BMKG, student privacy, cost to scale beyond Kalteng, schools with bad internet.
- [ ] **[You]** Every team member can explain how a recommendation is calculated ("pemahaman materi" is 20%).

## 11. Reframe: dari peringatan menjadi tindakan, untuk Indonesia (3 Nov 2026)

Direction set by the user: Awasin is for Indonesia, and schools are where it starts. Proposal-only change; no code changed. The prototype area in the proposal is still Kalimantan + Jawa + Sulawesi until section 10 / the 3 Nov plan runs.

- [x] **[Claude]** `Proposal/build/buat_docx.py`: new title (no area named), abstract opens with the Sumatra 2025 warning-without-action story and the 283.270 ISPA count, BAB 1.1 renamed "Peringatan ada, tindakan terlambat" with a new first paragraph, BAB 1.3 gets a "why schools first" paragraph, Tabel 11 gets stage 3 "Di luar sekolah" (ASEAN becomes stage 4), four new references (detikNews 2025, Kompas.com 2025, Mongabay 2026, Okezone 2026), all checked against the article text on 3 Nov. Rebuilt: 30 pages, 1,15 MB, author set.
- [x] **[Claude]** `Proposal/TUTORIAL_VIDEO_DEMO.md`: problem scene opens with Sumatra 2025, closing card says "Dari peringatan menjadi tindakan", and two new "don't say" rules.
- [x] **[Claude]** The 3 Nov plan, Task 6: keeps the new title and closing card.
- [ ] **[You]** Rewrite these new sentences in your own words: the abstract's first paragraph and its "Sekolah adalah titik awal" sentence, the whole first paragraph of BAB 1.1, the ISPA clause added to its second paragraph, the "Sekolah dipilih sebagai titik awal" paragraph in BAB 1.3, and Tabel 11 row 3.
- [ ] **[You]** Check dates: the guidebook (p. 9 and 13) says the deadline is 9 Nov 23.59 WIB, finalists 19 Nov, final 3–12 Dec, awarding 14 Jan 2027. The "Submit by" line at the top of this file says 8 Nov / 11 Nov / 19 Nov / 22 Nov.
- Not built, so not claimed anywhere: a Siklon Senyar replay and a "sudah diumumkan" confirmation loop. Both are candidates if there is time after section 10.
