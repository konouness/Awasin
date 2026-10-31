# Awasin TODO

> **Where we left off (1 Nov 2026):** Plan `docs/superpowers/plans/2026-10-31-awasin-finish.md` is built and committed locally on `main` (not pushed). Waiting on you: approve the SE citation for the back-test chart (`docs/backtest/README.md`), decide the ISPU averaging and SE 20/2026 strictness question (`docs/sources.md`), add `GEMINI_API_KEY` and check `DEMO_PASSWORD` in Vercel, then push from konouness. The "571.338 murid, 11 Agustus" number has no source yet; do not use it.

Deadline penyisihan: **8 Nov 2026** (extended from 31 Oct, announced 31 Oct; confirm the exact time on the ADIKARA website). The dates below are the original ones and may shift too. Judging: 1–9 Nov. Finalists: 11 Nov. Final: 19 Nov. Awarding: 22 Nov.

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
- [ ] **[Both]** Find the real SE or closure date for that event from a news source (2021 or newer). Claude found two (Barito Selatan PJJ 20 Aug, SE Gubernur 31 Aug) in `docs/backtest/README.md`; you approve before they go on the chart.
- [ ] **[You]** Put the chart in the proposal and the video.

## 3. Threshold sources

- [x] **[Claude]** Verify the haze cutoffs (55.5 / 150.5 / 250.5 µg/m³) against the ISPU PM2.5 categories in PermenLHK P.14/2020.
- [x] **[Claude]** Verify the rain cutoffs (50 / 100 / 150 mm per day) against BMKG's rain categories.
- [x] **[Claude]** Show "Ambang: ISPU KLHK" and "Kategori hujan: BMKG" on the school page.
- [x] **[Both]** Do not cite the 2015 Kemendikbud SE (older than the 2020 source floor). Look for the updated 2026 Kemendikdasmen SE. If only the 2015 one exists, ask before using it. Found: SE Mendikdasmen 20/2026 (see `docs/sources.md`).
- [ ] **[You]** Decide: ISPU uses a 24-hour average but Awasin scores hourly values, and SE 20/2026 orders full PJJ at ISPU above 200 while Awasin says daring only above 300. `score.ts` is unchanged until you choose.

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

---

## Gaps found (not done yet)

### Code and deploy
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
- [ ] Opening numbers: 3.524 sekolah, 571.338 murid PJJ karena asap (11 Agustus 2026). **No source found for these (checked 1 Nov); find one or drop them.** Kalteng's province-wide PJJ started 31 Aug (SE Gubernur).
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

### Final round prep (after 11 Nov, if you are a finalist)
- [ ] **[Both]** Slides for 7 minutes of presentation and demo.
- [ ] **[Both]** Q&A bank: where the thresholds come from, accuracy (back-test), fake reports (photo check), why not just BMKG, student privacy, cost to scale beyond Kalteng, schools with bad internet.
- [ ] **[You]** Every team member can explain how a recommendation is calculated ("pemahaman materi" is 20%).
