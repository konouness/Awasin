# Awasin Kejelasan + Sumatra Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Awasin a public, no-login tool for everyone in Indonesia, remove what confuses judges on the live site, and change the prototype area from Kalimantan + Jawa + Sulawesi to Kalimantan + Jawa + Sumatra.

**Decisions (user, 4 Nov 2026), replacing the 3 Nov version of this plan:**
- Delete: automatic mode daring, the mode darurat panel, field reports (and with them the report vs satellite match), and the health check-in.
- Delete every login: school accounts, the Dinas account, and the demo login. No page needs an account.
- Keep the Dinas dashboard and the AI surat edaran draft, open to everyone.
- The five actions are worded for everyone, not only students. The action keys (`normal`, `kurangi_luar`, `tunda_masuk`, `pulang_awal`, `daring`) stay, so the database, the replay data and the back-test don't change.
- Keep from the 3 Nov plan: the haze label, the "raised by hotspots" line, the legend fix, and Sulawesi → Sumatra. The 3 Nov Task 1 (automatic mode daring ends by itself) is dropped, because mode daring is gone.

**Known cost of the deletions:** field reports were the only ground truth from the field, and "Tidak terdeteksi satelit" was what set Awasin apart from a forecast map. Without them, the answer to "why not just BMKG or IQAir?" has to be the per-location action, the hotspot-upwind rule, and the back-test. The proposal (Task 9) must not claim crowdsourcing anywhere.

**Architecture:** Mostly deletion. The app keeps the hourly pipeline, the public map, school pages, replay, Telegram alerts, the dashboard and the draft. A migration drops the tables and functions that only the removed features used, then removes the Sulawesi schools. The replay is re-baked, then the proposal and the video guide are updated from the new numbers.

**Tech Stack:** Next.js 15, Supabase (Postgres + RLS + pg_cron), Vitest, NASA FIRMS area API, Open-Meteo, Gemini, python-docx (`Proposal/build/buat_docx.py`).

## Global Constraints

- No comments in any code (project rule since 2026-10-10).
- UI copy stays in Bahasa Indonesia.
- Only real schools from Dapodik (`https://referensi.data.kemdikbud.go.id`). Never invent an NPSN, name, or coordinate.
- The published back-test (25 Kalteng schools; 17/20/31 Aug = 10/13/19 daring) must not change. Do not rerun `scripts/backtest.mts`. Leave the back-test chart as it is: it describes schools, so "Belajar daring" is still correct there.
- Open-Meteo free tier ≈ 10,000 calls/day; each school costs 48/day. 85 schools ≈ 4,100.
- FIRMS bbox order is `west,south,east,north`. New value: `95,-9,119.5,6.5`.
- New haze label, everywhere: `Asap / polusi udara`.
- Proposal stays at 30 pages or fewer and under 10 MB after `sh build/ekspor.sh`.
- Anything that writes to production (Supabase `db push`, seed, storage delete, `git push`) waits for the user's go. Push from the konouness account only.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## New action wording

| Key | Old label | New label |
|---|---|---|
| `normal` | Masuk normal | Beraktivitas normal |
| `kurangi_luar` | Kurangi kegiatan luar ruang | Kurangi kegiatan luar ruang |
| `tunda_masuk` | Tunda jam masuk | Tunda bepergian |
| `pulang_awal` | Pulangkan lebih awal | Pulang lebih awal |
| `daring` | Belajar daring | Belajar dan bekerja dari rumah |

`daring` is not "Tetap di rumah", because at banjir level 3 staying put can be the wrong advice.

Advice (`src/lib/advice.ts`):
- asap: `Pakai masker saat di luar. Tutup jendela dan batasi kegiatan di luar.`
- banjir: `Pindahkan barang ke tempat tinggi dan pastikan jalur pulang aman.`
- angin: `Jauhi pohon dan papan reklame. Tunda olahraga dan acara di lapangan terbuka.`

Other copy:
- Map heading: `Apa yang sebaiknya dilakukan hari ini`.
- Map subtitle: `{n} lokasi sekolah di {p} provinsi, prakiraan 6 jam ke depan.` Schools stay the reference points.
- School page, under the name: `Rekomendasi untuk warga, siswa, dan pekerja di sekitar sekolah ini.`
- Telegram box: `Kami kirim pesan saat risiko di sekitar sekolah ini naik.`
- Telegram alert: `⚠️ Sekitar ${schoolName}: …`. `/start` reply: `Terdaftar untuk sekitar ${school.name}. …`
- `layout.tsx` description: `Peringatan dini asap, banjir, dan angin kencang untuk warga dan sekolah di Kalimantan, Jawa, dan Sumatra.`

## Review Focus

1. A page or server action still reads a dropped table, and production returns an error after the migration. Expected: `grep -rnE "field_reports|emergencies|health_checkins|profiles|dinas_overview|predicted_level_at|getSessionProfile" src scripts` prints nothing. Pinned in Task 1, Step 6.
2. The public draft button is clicked 1,000 times and burns through the Gemini free quota. Expected: one Gemini call per kabupaten per set of totals for 6 hours, and failed calls are not cached. Pinned in Task 2.
3. A Sumatra row with swapped or empty coordinates lands outside the FIRMS box and always looks "safe". Pinned by the seed test in Task 7.
4. The 9–11 Aug replay with Riau, Jambi and Sumsel fires makes `data.json` (2.3 MB today) too big. Expected: under 4,000 KB. Pinned in Task 7, Step 7.
5. The proposal still describes login, reports, check-in or mode daring. Pinned by the grep in Task 8, Step 4.

---

### Task 0: Record the decision, back up production

- [ ] **Step 1:** In `TODO.md`, add `## 12. Tanpa login, untuk semua warga, Sumatra (4 Nov 2026)` with the Decisions list above, and mark section 10 as replaced by it. Commit: `docs: 4 Nov scope decisions`.
- [ ] **Step 2 (after the user's go):** Dump the data that Task 3 drops, to a file outside the repo: `npx supabase db dump --linked --data-only -s public -f ../awasin-backup-2026-11-04.sql`. Check that the file contains `field_reports`.

### Task 1: Remove login, reports, check-in and mode daring from the code

**Delete:**
- `src/app/login/`, `src/app/lapor/`, `src/app/s/`
- `src/app/sekolah/[npsn]/EmergencyPanel.tsx`, `src/app/sekolah/[npsn]/actions.ts`
- `src/components/LogoutButton.tsx`, `src/middleware.ts`, `src/lib/demo.ts`
- `src/notify/announce.ts`, `src/notify/announceText.ts`, `src/reports/`
- `scripts/as-user.mjs`
- `tests/lib/demo.test.ts`, `tests/notify/announce.test.ts`, `tests/reports/`

**Modify:**
- `src/lib/supabase/server.ts`: delete `SessionProfile` and `getSessionProfile`.
- `src/components/Topbar.tsx`: becomes a plain component: the brand link and `<Link href="/dinas">Dasbor dinas</Link>`. No session lookup, no `async`.
- `src/app/sekolah/[npsn]/page.tsx`: remove `getSessionProfile`, `isOwner`, `activeEm`, and the whole `EmergencyPanel` / absen banner block.
- `src/notify/decide.ts`: delete `shouldActivateEmergency`. `tests/notify/decide.test.ts`: delete its test.
- `src/notify/after.ts`: `afterStatus(list)` takes no second argument. Drop the `emergencies` query, `hasActive`, and the activation block.
- `src/app/api/cron/refresh/route.ts`: `realDeps(now, afterStatus)`, no `announceEmergency` import.

- [ ] **Step 1:** Do the deletions and edits above.
- [ ] **Step 2:** Run `npx tsc --noEmit`, and fix every import error it names by deleting the caller, not by stubbing it.
- [ ] **Step 3:** Run `npm test`, expect PASS.
- [ ] **Step 4:** Run `npm run build`, expect no `/login`, `/lapor` or `/s/[npsn]/absen` route in the output.
- [ ] **Step 5:** Remove `DEMO_LOGIN` and `DEMO_PASSWORD` from `.env.example` and from the README setup list, and delete the README "Demo accounts" section.
- [ ] **Step 6:** `grep -rnE "field_reports|emergencies|health_checkins|profiles|dinas_overview|predicted_level_at|getSessionProfile|DEMO_" src scripts` prints nothing. Commit: `feat: remove login, field reports, check-in and mode daring`.

### Task 2: Dashboard and surat edaran draft open to everyone

**Files:**
- Modify: `src/app/dinas/page.tsx`, `src/app/dinas/actions.ts`, `src/app/dinas/SeDraft.tsx`, `src/se/draft.ts`
- Test: `tests/se/draft.test.ts`

- [ ] **Step 1: Test first.** In `draft.test.ts`, `Overview` rows become `{ school_id, npsn, name, kabupaten, action, hazard, levels }`. `kabTotals` returns `{ kabupaten, schools, byAction }`. `sePrompt` must not contain `Laporan`, `sakit` or `mode belajar daring`. Run `npx vitest run tests/se/draft.test.ts`, expect FAIL.
- [ ] **Step 2: `draft.ts`.** Shrink `Overview` and `KabTotals` to the fields above. Remove the three report, sick and emergency lines from `sePrompt`. Add `export const overviewSelect = 'id, npsn, name, kabupaten, school_status(action, hazard, levels)'` and `toOverview(row)` mapping that select's shape to `Overview` (missing status → `normal`, `null`, `null`).
- [ ] **Step 3: `page.tsx`.** No redirect, no reports. Read `db.from('schools').select(overviewSelect)` with the anon client, map with `toOverview`, sort by action then name. The table keeps the Sekolah and Rekomendasi columns only. Delete the whole "Laporan lapangan terbaru" section.
- [ ] **Step 4: `actions.ts`.** Drop the role check. Same `schools` read as the page. Wrap the Gemini call so repeat clicks don't call Gemini again:

```ts
const cachedDraft = unstable_cache(
  async (prompt: string) => {
    const text = await askGemini(prompt);
    if (!text) throw new Error('gemini');
    return text;
  },
  ['se-draft'],
  { revalidate: 21600 },
);
```

  Call `cachedDraft(sePrompt(t, today))` inside `try`, and return `UNAVAILABLE` in `catch`. Throwing keeps a failed call out of the cache. The prompt includes the date and the totals, so a new day or changed totals gets a new draft.
- [ ] **Step 5: `SeDraft.tsx`.** Privacy line becomes `Hanya jumlah sekolah per rekomendasi yang dikirim ke AI.`
- [ ] **Step 6:** Run `npm test`, expect PASS. Check with `npm run dev` in a private window: `/dinas` loads without logging in, and the draft button returns a letter twice in a row (the second one instantly). Commit: `feat: dashboard and draft are public`.

### Task 3: Database without accounts

**Files:**
- Create: `supabase/migrations/20261104000001_tanpa_login.sql`
- Modify: `supabase/seed.sql`, `supabase/tests/rls.sql`

- [ ] **Step 1: Migration**, in one transaction:

```sql
drop policy if exists "reports insert own school" on storage.objects;
drop policy if exists "reports read own school or dinas" on storage.objects;
drop function if exists public.dinas_overview(date);
drop function if exists public.predicted_level_at(uuid, text, timestamptz);
drop table public.health_checkins, public.field_reports, public.emergencies, public.tasks, public.push_subscriptions;
drop table public.profiles;
drop function public.my_school_id();
delete from auth.users where email like '%@awasin.id';
```

  Before running it, `grep -n "my_school_id\|profiles" supabase/migrations/*.sql` and make sure no policy that stays (on `schools`, `forecasts`, `school_status`, `refresh_runs`, `hotspots`, `telegram_chats`, `notify_state`) uses them. If one does, rewrite that policy in this migration first.
- [ ] **Step 2: Seed.** Delete everything from the demo-account section to the end except the final `commit;`. Delete the `app.demo_password` check. The seed then holds schools only.
- [ ] **Step 3: RLS test.** Rewrite `supabase/tests/rls.sql`: as `anon`, the test can read `schools`, `forecasts`, `school_status`, `refresh_runs` and `hotspots`; it gets 0 rows or a privilege error from `telegram_chats` and `notify_state`; and `insert into public.schools` fails. It ends with `rls ok` and rolls back, as now.
- [ ] **Step 4:** Run `npm test`, expect PASS. Commit: `feat: drop account, report and check-in tables`.
- [ ] **Step 5 (after the user's go, and after Task 1's code is deployed):**
  1. Empty and delete the photo bucket through the Storage API (Supabase refuses SQL deletes on storage tables): `npx tsx --env-file=.env.local -e "import { createClient } from '@supabase/supabase-js'; const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!); await s.storage.emptyBucket('reports'); console.log(await s.storage.deleteBucket('reports'));"`
  2. `npx supabase db push`
  3. `bash scripts/test-db.sh` prints `rls ok`.
  4. Remove `DEMO_LOGIN` and `DEMO_PASSWORD` from Vercel (the user does this in the dashboard).

### Task 4: Wording for everyone, and the haze label

**Files:**
- Modify: `src/lib/status.ts`, `src/lib/advice.ts`, `src/app/(peta)/page.tsx`, `src/app/sekolah/[npsn]/page.tsx`, `src/notify/telegram.ts`, `src/app/api/telegram/route.ts`, `src/app/layout.tsx`, `../Proposal/build/diagram.py`
- Test: `tests/notify/decide.test.ts`, `tests/notify/telegram.test.ts`

- [ ] **Step 1:** Update the test expectations to the new labels: `'Asap / polusi udara level 3'` and an alert text starting `⚠️ Sekitar`. Run `npx vitest run tests/notify`, expect FAIL.
- [ ] **Step 2:** Apply the "New action wording" section: `ACTION_LABEL`, `HAZARD_LABEL.asap = 'Asap / polusi udara'`, `HAZARD_ADVICE`, and the other copy lines.
- [ ] **Step 3:** In `diagram.py:58`, replace the first line of the box with `Asap / polusi udara`.
- [ ] **Step 4:** `grep -rnE "Asap karhutla|Masuk normal|Tunda jam masuk|Pulangkan lebih awal|'Belajar daring'|dilakukan sekolah" src tests` prints nothing. Run `npm test`, expect PASS. Commit: `feat: actions worded for everyone, haze label names PM2.5`.

### Task 5: School page says when hotspots raised the level

**Files:**
- Modify: `src/risk/score.ts`, `src/app/sekolah/[npsn]/page.tsx`
- Test: `tests/risk/score.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
test('raisedByFires spots the upwind-hotspot bump', () => {
  expect(raisedByFires(levelAsap(28, 12), 28)).toBe(true);
  expect(raisedByFires(levelAsap(28, 0), 28)).toBe(false);
  expect(raisedByFires(levelAsap(204, 0), 204)).toBe(false);
  expect(raisedByFires(levelAsap(300, 12), 300)).toBe(false);
});
```

  The last line is the level-3 cap: a 300 µg/m³ hour is level 3 with or without hotspots.
- [ ] **Step 2:** Run `npx vitest run tests/risk/score.test.ts`, expect FAIL.
- [ ] **Step 3:** Implement `raisedByFires(level, pm25)` as `level > step(pm25, [55.5, 150.5, 250.5])`, reusing `step`.
- [ ] **Step 4:** In the sign section, under the cause line, when `cause === 'asap'` and some row in `series('asap').slice(0, 6)` has `level === top` and `raisedByFires(r.level, r.score)`, render:
  `<p className="small">Naik satu level: ada 10 titik panas atau lebih dalam 50 km di arah datangnya angin. Titik panas bisa kebakaran lahan, bisa juga pabrik atau PLTU.</p>`
- [ ] **Step 5:** Run `npm test`. Check with `npm run dev`: `/sekolah/30202502?putar=2026-08-09` shows the line only if that day's peak was raised by hotspots. Commit: `feat: school page explains the hotspot bump`.

### Task 6: Jenjang legend lists only types on the map

**Files:**
- Modify: `src/lib/jenjang.ts`, `src/app/(peta)/page.tsx` (the `Object.keys(JENJANG_LABEL)` loop)
- Test: `tests/lib/jenjang.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
test('jenjangPresent keeps legend order and only what exists', () => {
  expect(jenjangPresent(['SMAN 1 PALANGKA RAYA', 'SD NEGERI 1 JAAR', 'SDN BARU 01 PAGI'])).toEqual(['SD', 'SMA']);
  expect(jenjangPresent([])).toEqual([]);
});
```

- [ ] **Step 2:** Run it, expect FAIL. Implement it with `jenjangOf`, filtering `Object.keys(JENJANG_LABEL)`. Loop over `jenjangPresent(rows.map((r) => r.name))` in the map page.
- [ ] **Step 3:** Run `npm test`, expect PASS. Commit: `fix: jenjang legend shows only types on the map`.

### Task 7: Area becomes Kalimantan + Jawa + Sumatra

**Files:**
- Modify: `src/sources/firms.ts:19`, `tests/sources/parse.test.ts:37-40`, `tests/seed.test.ts`, `supabase/seed.sql`, `docs/spec.md`, `README.md`, `src/replay/data.json` (re-baked)
- Create: `supabase/migrations/20261104000002_tanpa_sulawesi.sql`

- [ ] **Step 1: Tests first.**
  - `parse.test.ts`: rename to `'firms area covers Sumatra, Jawa and Kalimantan'`; expect `{ west: 95, south: -9, east: 119.5, north: 6.5 }` and `'/VIIRS_NOAA21_NRT/95,-9,119.5,6.5/2'`.
  - `seed.test.ts`: `toHaveLength(85)`. Replace the six Sulawesi provinces with `'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Kepulauan Riau', 'Jambi', 'Sumatera Selatan', 'Kepulauan Bangka Belitung', 'Bengkulu', 'Lampung'`. Keep the bbox, uniqueness and Kalteng = 25 checks.
- [ ] **Step 2:** Run them, expect FAIL. Set the new `FIRMS_BBOX`.
- [ ] **Step 3: Pick 30 real schools,** 3 SD Negeri per Sumatra province, from Dapodik:
  Aceh: Aceh Barat · Sumatera Utara: Labuhanbatu · Sumatera Barat: Dharmasraya · Riau: Pelalawan · Kepulauan Riau: Bintan · Jambi: Muaro Jambi · Sumatera Selatan: Ogan Komering Ilir · Kepulauan Bangka Belitung: Bangka · Bengkulu: Bengkulu Utara · Lampung: Mesuji.
  Swap a kabupaten only if it has no school with usable coordinates. Copy NPSN, name (uppercase, as Dapodik shows it), lintang, bujur and kabupaten exactly. Skip any school with empty or zero coordinates, or with a point outside its kabupaten. If the site blocks automated access, stop and ask the user to export the rows.
- [ ] **Step 4: Seed:** delete the 18 Sulawesi rows and add the 30 new ones in the same 6-column format.
- [ ] **Step 5: Migration** `20261104000002_tanpa_sulawesi.sql`: `delete from public.schools where provinsi in ('Sulawesi Utara', 'Gorontalo', 'Sulawesi Tengah', 'Sulawesi Barat', 'Sulawesi Selatan', 'Sulawesi Tenggara');`. After Task 3, nothing without a cascade points at `schools` any more. Check with `grep -n "references public.schools" supabase/migrations/*.sql` that every remaining reference says `on delete cascade`.
- [ ] **Step 6:** Run `npm test`, expect PASS. Then, **after the user's go** and after Task 3, Step 5: `npx supabase db push`, then `psql "$SUPABASE_DB_URL" -f supabase/seed.sql`. Check: `select provinsi, count(*) from schools group by 1` has 21 rows totalling 85, Kalimantan Tengah = 25.
- [ ] **Step 7: Re-bake:** `npx tsx --env-file=.env.local scripts/bake-replay.mts`. Expect 85 `sekolah` per day and `data.json` under 4,000 KB. If it's bigger, round hotspots to 3 decimals in `snapshotAt` and bake again. Write down the 9 Aug totals per action, the hotspot count, and the Kalteng-only counts. Kalteng must still be 8 normal / 12 tunda / 5 daring; if not, stop and report.
- [ ] **Step 8: Copy:** `spec.md` area line → `- Wilayah prototipe: 21 provinsi di Kalimantan, Jawa, dan Sumatra, 85 sekolah sebagai titik acuan. Back-test tetap 25 sekolah Kalteng.` `README.md`: the same scope, and drop "matches teachers' field reports" and "emergency mode" from the intro.
- [ ] **Step 9:** Run `npm test && npm run lint && npm run build`, expect PASS. Commit: `feat: area is Kalimantan, Jawa, Sumatra`.

### Task 8: Proposal matches the site

**Files:**
- Modify: `../Proposal/build/buat_docx.py`, `../Proposal/build/diagram.py`
- Regenerated: the diagrams (`python3 build/diagram.py img`), the `.docx` and `.pdf` (`sh build/ekspor.sh`)

Find each place by its text, not its line number. The line numbers below are from 4 Nov.

- [ ] **Step 1: Remove the cut features.**
  - Abstract (`:271`) and 1.3 Solusi (`:291-300`): drop field reports, report matching, mode daring and the health check-in. Describe Awasin as one action per location for everyone nearby (warga, siswa, pekerja), with schools as the reference points, plus Telegram alerts and a public dashboard with an AI draft for Dinas.
  - 2.2 Manfaat (`:322-325`): one row for the public (warga, orang tua, pekerja), one for sekolah, one for Dinas. No row describes logging in.
  - 3.1 and 3.3 (`:330-346`): drop every report, check-in, mode daring and account limit.
  - 4.2 Tahapan: keep the old rows (they are history), add `['6. Iterasi 4: penyederhanaan dan Sumatra', '4 Nov 2026', 'Menghapus login, laporan lapangan, absen kesehatan, dan mode daring; rekomendasi ditulis untuk semua warga; dasbor dan draf surat edaran dibuka untuk umum; Sulawesi diganti Sumatra (85 sekolah, 21 provinsi); label asap menjadi polusi udara PM2.5; halaman sekolah menjelaskan kenaikan level karena titik panas.']`. If the PDF goes over 30 pages, merge this into row 5's text instead.
  - 4.3 Pengujian (`:361`): the RLS test now checks that the public can read but not write. Drop report matching from the unit-test list.
  - 5.2 Pengguna (`:366-372`): users are Publik (warga, orang tua, pekerja), Dinas Pendidikan (no account), and Penjadwal.
  - 5.3 F-xx table (`:373-386`): delete the report, match, mode daring, check-in and login rows, then renumber F-01… in order. Add `Dasbor dan draf surat edaran dapat dibuka tanpa akun; draf yang sama dipakai ulang selama 6 jam.`
  - 5.4 and 5.5: drop auth, RLS by school, and photo storage.
  - 6.2 Implementasi modul (`:426-431`): delete the report, check-in and mode daring modules.
  - 6.6 → `6.6 Tautan prototipe`: the link only, no accounts or password.
  - BAB 7: delete 7.3 (Laporan lapangan dan absen kesehatan) and its figures. 7.2 becomes `Halaman sekolah`, with no login figure. 7.4 becomes 7.3 `Dasbor dan draf surat edaran`.
- [ ] **Step 2: Diagrams (`diagram.py`).**
  - Use case: actors `Publik (warga, orang tua, pekerja)`, `Dinas Pendidikan`, `Penjadwal (pg_cron)`. Cases: view the map, view a recommendation and its 24-hour chart, subscribe on Telegram, view the dashboard, make the AI draft, update scores every hour. Delete the check-in, report and mode daring cases.
  - ERD: delete `profiles`, `field_reports`, `emergencies`, `health_checkins`. Keep `schools`, `forecasts`, `school_status`, `telegram_chats` and the supporting-tables line.
- [ ] **Step 3: New numbers from Task 7, Step 7** (`N` schools, `F` hotspots, four 9 Aug counts):
  - Abstract → `85 sekolah di 21 provinsi di Kalimantan, Jawa, dan Sumatra`.
  - BAB 3 item 1 → `(21 provinsi) dengan 85 sekolah …`, ending with `Sulawesi dan wilayah lain belum dicakup (rencana perluasan di Bab 6.4).`
  - FIRMS area → `Sumatra, Jawa, dan Kalimantan`. Scale row → `'Kalimantan, Jawa, dan Sumatra: 21 provinsi, 85 sekolah'`, `'Sekitar 4.100 panggilan per hari, atau 41% kuota gratis. Biaya Rp 0.'`
  - Map figure caption: the new counts, using the new action labels.
  - Every action label in the text uses the new wording, except in the back-test section (6.5), which is about schools.
- [ ] **Step 4: Check.** `grep -niE "laporan lapangan|absen|mode daring|mode darurat|login|masuk sebagai|akun demo|kata sandi|crowdsourc|Sulawesi" ../Proposal/build/buat_docx.py` leaves only the BAB 3 roadmap mention of Sulawesi and the 4.2 history rows. Run `sh build/ekspor.sh`: ≤ 30 pages, < 10 MB, and `author` is `Muhammad Faiz Ghiffari` (same `fitz` check as 4 Nov).
- [ ] **Step 5:** Add the rewritten paragraphs (abstract, 1.3, 2.2, 5.2) to the `TODO.md` "rewrite in your own words" list.

### Task 9: Video guide matches the site

**Files:**
- Modify: `../Proposal/TUTORIAL_VIDEO_DEMO.md`, `tests/ui/copy.test.ts`

- [ ] **Step 1:** Delete the scenes `1:40–2:00 Masuk sebagai Sekolah, kirim laporan` and `2:00–2:10 Mode daring dan absen kesehatan`, and their read-aloud lines. Scene `2:10–2:28` becomes "open `/dinas`, no login", shows the table, and makes a draft. Give the freed 30 seconds to the school page: point at the titik panas line from Task 5 and the 24-hour chart.
- [ ] **Step 2:** Replace every `73`, `17 provinsi`, `29 … 6 … 30 … 8`, `5.992`, `Kalimantan, Jawa, dan Sulawesi`, and every old action label with the new values. Delete the Persiapan step about ending Jaar's mode daring, and every "don't say" rule about reports, check-in or accounts. Keep the rule that Awasin must not be said to prevent the 2025 flood deaths.
- [ ] **Step 3:** Rebuild `QUOTED` in `copy.test.ts` from the strings the new script quotes. Run `npm test`, expect PASS. Commit: `docs: video guide without login`.

### Task 10: Hand over

- [ ] **Step 1:** Commit anything left in the Awasin repo. The Proposal folder isn't in git.
- [ ] **Step 2:** Tell the user:
  - Order for production: `git push` (code) → Task 3, Step 5 → Task 7, Step 6 → re-bake → `git push` (`data.json`). Each step waits for their go.
  - Retake every BAB 7 screenshot, since every page changed.
  - Rewrite the paragraphs listed in `TODO.md` in their own words.
  - After one hourly refresh, spot-check `/`, `/?putar=2026-08-09`, `/sekolah/30202502` and `/dinas` in a private window.
