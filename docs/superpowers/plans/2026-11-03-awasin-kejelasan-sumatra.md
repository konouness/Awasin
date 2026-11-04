# Awasin Kejelasan + Sumatra Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove what confuses judges on the live site and change the prototype area from Kalimantan + Jawa + Sulawesi to Kalimantan + Jawa + Sumatra.

**Architecture:** Five small changes that don't depend on each other: auto mode daring now ends by itself, the haze label stops saying "karhutla", the school page says when fires raised the level, and the jenjang legend lists only the types that exist. The area change works like the 1 Nov plan: schools are data, the FIRMS box moves, a migration removes the Sulawesi schools, and the replay is re-baked. The proposal and video guide are updated last, from the re-baked numbers.

**Tech Stack:** Next.js 15, Supabase (Postgres + RLS + pg_cron), Vitest, NASA FIRMS area API, Open-Meteo, python-docx (`Proposal/build/buat_docx.py`).

**Spec:** the 3 Nov 2026 review findings 1, 2, 4, 6, 7 and the scope decision ("gausah Sulawesi, cukup Kalimantan, Jawa, dan Sumatra"). Task 0 copies them into `TODO.md` section 10 so the executor has them.

## Global Constraints

- No comments in any code (project rule since 2026-10-10).
- UI copy stays in Bahasa Indonesia.
- Only real schools from Dapodik (`https://referensi.data.kemdikbud.go.id`). Never invent an NPSN, name, or coordinate.
- The published back-test (25 Kalteng schools; 17/20/31 Aug = 10/13/19 daring) must not change. Do not rerun `scripts/backtest.mts`.
- Open-Meteo free tier ≈ 10,000 calls/day; each school costs 48/day. 85 schools ≈ 4,100. Ceiling stays 150 schools.
- FIRMS bbox order is `west,south,east,north`. New value: `95,-9,119.5,6.5` (Aceh and Sabang to Kalimantan Utara's east coast, south coast of Jawa). It no longer covers Sulawesi.
- New haze label, everywhere: `Asap / polusi udara`.
- Proposal stays at 30 pages or fewer and under 10 MB after `sh build/ekspor.sh`.
- Anything that writes to production (Supabase `db push`, seed, `git push`) waits for the user's go. Push from the konouness account only.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. A school that turned mode daring on itself has it switched off by the hourly run. Expected: never. Pinned in Task 1 (`shouldEndEmergency` with `started_by: 'sekolah'`).
2. A school that flips daring → tunda → daring every hour gets a new announcement each hour. Expected: an automatic mode daring lasts at least 6 hours. Pinned in Task 1 (5 h 59 min → false).
3. Deleting a Sulawesi school fails because `profiles.school_id` and `field_reports.reporter_id` have no cascade. Expected: the migration removes reports, then the demo users, then the schools. Pinned by the count check in Task 5, Step 7.
4. A Sumatra row with swapped or empty coordinates lands outside the FIRMS box and always looks "safe". Pinned by the seed test in Task 5.
5. The 9–11 Aug replay with Riau, Jambi and Sumsel fires makes `data.json` (2.3 MB today) too big. Expected: under 4,000 KB. Pinned by the size check in Task 5, Step 8.

---

### Task 0: Record the decision, commit pending work

- [ ] **Step 1:** `git status` shows `M TODO.md` (3 Nov handoff note). Add section `## 10. Kejelasan + Sumatra (3 Nov 2026)` listing the five items in this plan's Goal and the new area, then commit both together: `docs: 3 Nov review decisions`.

### Task 1: Automatic mode daring ends by itself, stale ones closed

**Files:**
- Modify: `src/notify/decide.ts`, `src/notify/after.ts:21-25,43-48`
- Create: `supabase/migrations/20261104000001_akhiri_mode_daring.sql`
- Test: `tests/notify/decide.test.ts`

**Interfaces:**
- Produces: `shouldEndEmergency(action: Action, startedBy: string, startedAt: Date, now: Date): boolean` in `src/notify/decide.ts`.

- [ ] **Step 1: Write the failing test**

```ts
test('automatic mode daring ends after the risk drops, never one the school started', () => {
  const start = new Date('2026-11-03T07:00:00Z');
  const later = (h: number, m = 0) => new Date(start.getTime() + h * 3600e3 + m * 60e3);
  expect(shouldEndEmergency('tunda_masuk', 'otomatis', start, later(6))).toBe(true);
  expect(shouldEndEmergency('normal', 'otomatis', start, later(30))).toBe(true);
  expect(shouldEndEmergency('tunda_masuk', 'otomatis', start, later(5, 59))).toBe(false);
  expect(shouldEndEmergency('daring', 'otomatis', start, later(30))).toBe(false);
  expect(shouldEndEmergency('normal', 'sekolah', start, later(30))).toBe(false);
});
```

- [ ] **Step 2: Run `npx vitest run tests/notify/decide.test.ts`, expect FAIL** (not exported).

- [ ] **Step 3: Implement `shouldEndEmergency`.** True only when `startedBy === 'otomatis'`, `action !== 'daring'`, and at least 6 hours have passed.

- [ ] **Step 4: Use it in `afterStatus`.** Select `school_id, started_by, started_at` for active emergencies. For each status where it returns true, set `ended_at = now()` on that school's open `otomatis` row, and drop the school from `hasActive`. Don't send a Telegram message when it ends.

- [ ] **Step 5: Migration** closing every open emergency once (leftovers from the 20 and 23 Oct tests, plus 3 Nov ones the new rule would end):

```sql
update public.emergencies set ended_at = now() where ended_at is null;
```

- [ ] **Step 6: Run `npm test`, expect PASS.** Commit: `feat: automatic mode daring ends when the risk drops`.

### Task 2: Haze label says what PM2.5 measures

**Files:**
- Modify: `src/lib/status.ts:12`, `tests/notify/decide.test.ts:18`, `../Proposal/build/diagram.py:58`

- [ ] **Step 1:** Change the test expectation to `'Asap / polusi udara level 3'`. Run `npx vitest run tests/notify/decide.test.ts`, expect FAIL.
- [ ] **Step 2:** Set `asap: 'Asap / polusi udara'` in `HAZARD_LABEL`. Every other place (Telegram, announcement, report form, Dinas, school page) reads this map. Check: `grep -rn "Asap karhutla" src tests` prints nothing.
- [ ] **Step 3:** In `diagram.py:58` replace the first line of the box with `Asap / polusi udara`. Leave the rest of the box as it is.
- [ ] **Step 4:** Run `npm test`, expect PASS. Commit: `fix: haze label names PM2.5 pollution, not only karhutla`.

### Task 3: School page says when fires raised the level

**Files:**
- Modify: `src/risk/score.ts`, `src/app/sekolah/[npsn]/page.tsx:62-70`
- Test: `tests/risk/score.test.ts`

**Interfaces:**
- Produces: `raisedByFires(level: Level, pm25: number): boolean` in `src/risk/score.ts`. True when `level` is above the PM2.5-only level (same `[55.5, 150.5, 250.5]` cuts as `levelAsap`).

- [ ] **Step 1: Write the failing test**

```ts
test('raisedByFires spots the upwind-fire bump', () => {
  expect(raisedByFires(levelAsap(28, 12), 28)).toBe(true);
  expect(raisedByFires(levelAsap(28, 0), 28)).toBe(false);
  expect(raisedByFires(levelAsap(204, 0), 204)).toBe(false);
  expect(raisedByFires(levelAsap(300, 12), 300)).toBe(false);
});
```

The last line is the level-3 cap: a 300 µg/m³ hour is level 3 with or without fires.

- [ ] **Step 2: Run `npx vitest run tests/risk/score.test.ts`, expect FAIL.**
- [ ] **Step 3: Implement `raisedByFires`** by reusing the existing `step` helper.
- [ ] **Step 4: Show it.** In the sign section, under the cause line, when `cause === 'asap'` and some row in `series('asap').slice(0, 6)` has `level === top` and `raisedByFires(r.level, r.score)`, render:
  `<p className="small">Naik satu level: ada 10 titik panas atau lebih dalam 50 km di arah datangnya angin.</p>`
- [ ] **Step 5:** Run `npm test && npm run lint`, expect PASS. Check with `npm run dev`: `/sekolah/30202502` shows the line today (PM2.5 under 55,5, level 1); `/sekolah/30202502?putar=2026-08-09` shows it only if that day's peak was raised by fires. Commit: `feat: school page explains the fire bump`.

### Task 4: Jenjang legend lists only types on the map

**Files:**
- Modify: `src/lib/jenjang.ts`, `src/app/page.tsx` (legend `Object.keys(JENJANG_LABEL)` loop)
- Test: `tests/lib/jenjang.test.ts`

**Interfaces:**
- Produces: `jenjangPresent(names: string[]): Jenjang[]`, in `JENJANG_LABEL` key order, no duplicates.

- [ ] **Step 1: Write the failing test**

```ts
test('jenjangPresent keeps legend order and only what exists', () => {
  expect(jenjangPresent(['SMAN 1 PALANGKA RAYA', 'SD NEGERI 1 JAAR', 'SDN BARU 01 PAGI'])).toEqual(['SD', 'SMA']);
  expect(jenjangPresent([])).toEqual([]);
});
```

- [ ] **Step 2:** Run `npx vitest run tests/lib/jenjang.test.ts`, expect FAIL.
- [ ] **Step 3:** Implement it with `jenjangOf`. In `page.tsx`, loop over `jenjangPresent(rows.map((r) => r.name))` instead of every key.
- [ ] **Step 4:** Run `npm test`, expect PASS. Commit: `fix: jenjang legend shows only types on the map`.

### Task 5: Area becomes Kalimantan + Jawa + Sumatra

**Files:**
- Modify: `src/sources/firms.ts:19`, `tests/sources/parse.test.ts:37-40`, `tests/seed.test.ts`, `supabase/seed.sql`
- Create: `supabase/migrations/20261104000002_tanpa_sulawesi.sql`
- Modify: `src/app/layout.tsx:10`, `docs/spec.md:44`, `README.md` (scope line), `src/replay/data.json` (re-baked)

**Interfaces:**
- Produces: `FIRMS_BBOX = { west: 95, south: -9, east: 119.5, north: 6.5 }`, and 85 schools in 21 provinces.

- [ ] **Step 1: Update the tests first**
  - `parse.test.ts`: rename to `'firms area covers Sumatra, Jawa and Kalimantan'`; expect the new box and `'/VIIRS_NOAA21_NRT/95,-9,119.5,6.5/2'`.
  - `seed.test.ts`: `expect(rows).toHaveLength(85)`. Replace the six Sulawesi names in the province set with `'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Kepulauan Riau', 'Jambi', 'Sumatera Selatan', 'Kepulauan Bangka Belitung', 'Bengkulu', 'Lampung'`. Keep the bbox, uniqueness and Kalteng = 25 checks.
- [ ] **Step 2:** Run `npx vitest run tests/sources/parse.test.ts tests/seed.test.ts`, expect FAIL.
- [ ] **Step 3:** Set the new `FIRMS_BBOX`.
- [ ] **Step 4: Pick 30 real schools,** 3 SD Negeri per Sumatra province, from Dapodik. Use these kabupaten, picked for peat and haze history. Swap one only if it has no school with usable coordinates:
  Aceh: Aceh Barat · Sumatera Utara: Labuhanbatu · Sumatera Barat: Dharmasraya · Riau: Pelalawan · Kepulauan Riau: Bintan · Jambi: Muaro Jambi · Sumatera Selatan: Ogan Komering Ilir · Kepulauan Bangka Belitung: Bangka · Bengkulu: Bengkulu Utara · Lampung: Mesuji.
  Copy NPSN, name (uppercase, as Dapodik shows it), lintang, bujur and kabupaten exactly. Skip any school with empty or zero coordinates, or with a point outside its kabupaten. If the site blocks automated access, stop and ask the user to export the rows.
- [ ] **Step 5: Seed:** delete the 18 Sulawesi rows (`Sulawesi Utara`, `Gorontalo`, `Sulawesi Tengah`, `Sulawesi Barat`, `Sulawesi Selatan`, `Sulawesi Tenggara`) and add the 30 new rows in the same 6-column format.
- [ ] **Step 6: Migration** `20261104000002_tanpa_sulawesi.sql`. Seed is an upsert, so this migration is what removes the rows from production. Delete in this order inside one transaction, all filtered by `provinsi in (<the six Sulawesi names>)`:
  1. `public.field_reports` of those schools
  2. `auth.users` whose `id` is in `public.profiles` with those `school_id` (cascades `profiles`)
  3. `public.schools` (cascades forecasts, status, emergencies, check-ins, Telegram chats, notify state)
- [ ] **Step 7:** Run `npm test`, expect PASS. Then, **after the user's go**, apply to production as on 1 Nov (`npx supabase db push`, then the seed with `app.demo_password`). Check: `select provinsi, count(*) from schools group by 1` has 21 rows totalling 85, Kalimantan Tengah = 25. `select count(*) from auth.users where email like 'demo+%'` = 85. `bash scripts/test-db.sh` prints `rls ok`.
- [ ] **Step 8: Re-bake:** `npx tsx --env-file=.env.local scripts/bake-replay.mts`. Expect 85 `sekolah` per day and `data.json` under 4000 KB. If it's bigger, round fires to 3 decimals in `snapshotAt` and bake again. Copy down the 9 Aug totals, the fire count, and the Kalteng-only counts. Kalteng must still be 8 normal / 12 tunda / 5 daring; if not, stop and report.
- [ ] **Step 9: Copy:**
  - `layout.tsx`: `…untuk sekolah di Kalimantan, Jawa, dan Sumatra.`
  - `spec.md:44`: `- Wilayah prototipe: 21 provinsi di Kalimantan, Jawa, dan Sumatra, 85 sekolah contoh. Back-test tetap 25 sekolah Kalteng.`
  - `README.md`: the same scope wherever it names provinces.
- [ ] **Step 10:** Run `npm test && npm run lint && npm run build`, expect PASS. Commit: `feat: area is Kalimantan, Jawa, Sumatra`.

### Task 6: Proposal and video guide match the site

**Files:**
- Modify: `../Proposal/build/buat_docx.py`, `../Proposal/TUTORIAL_VIDEO_DEMO.md`
- Regenerated: the proposal `.docx` and `.pdf` via `sh build/ekspor.sh`

- [ ] **Step 1: `buat_docx.py`**, using the numbers from Task 5, Step 8 (`N`, `F`, and the four 9 Aug counts). The 3 Nov reframe ("Dari peringatan menjadi tindakan", Indonesia-wide, schools first) moved every line below by a few lines, so find each by its text, not its number:
  - Title: leave it. Since the 3 Nov reframe it names no area (`…UNTUK INDONESIA, DIMULAI DARI SEKOLAH`).
  - `:272` abstract → `85 sekolah di 21 provinsi di Kalimantan, Jawa, dan Sumatra`
  - `:329` Bab 3 item 1 → `(21 provinsi) dengan 85 sekolah …`. End it with `Sulawesi dan wilayah lain belum dicakup (rencana perluasan di Bab 6.4).`
  - `:332` and `:381` (F-09): add `Mode daring yang aktif otomatis berakhir sendiri paling cepat 6 jam setelah rekomendasi turun.`
  - `:355`: add a row `['6. Iterasi 4: kejelasan dan Sumatra', '4 Nov 2026', 'Mengganti Sulawesi dengan Sumatra (85 sekolah, 21 provinsi), memberi label asap sebagai polusi udara PM2.5, menjelaskan kenaikan level karena titik panas, dan mengakhiri mode daring otomatis.']`. If the PDF goes over 30 pages, merge this into row 5's text instead.
  - `:425` FIRMS area → `Sumatra, Jawa, dan Kalimantan`
  - `:443` → `'Kalimantan, Jawa, dan Sumatra: 21 provinsi, 85 sekolah'`, `'Sekitar 4.100 panggilan per hari, atau 41% kuota gratis. Biaya Rp 0.'`
  - `:474` Gambar 6 caption: the new school count, fire count and four counts, with the area named as Kalimantan, Jawa, dan Sumatra.
  - Check: `grep -n "Sulawesi" ../Proposal/build/buat_docx.py` leaves only the line 329 roadmap mention.
- [ ] **Step 2: `TUTORIAL_VIDEO_DEMO.md`:**
  - Replace every `73`, `17 provinsi`, `29 … 6 … 30 … 8`, `5.992`, and `Kalimantan, Jawa, dan Sulawesi` with the new values.
  - Closing card: leave it (`Sekolah → puskesmas · desa · BPBD → ASEAN`, set by the 3 Nov reframe). Section 6 line → `Prototipe: Kalimantan, Jawa, Sumatra`.
  - Sumatra schools now exist in the prototype, but there is still no Siklon Senyar back-test. Keep the section 6 rule that Awasin must not be said to prevent the 2025 flood deaths.
  - Report-form step: `"Bencana" biarkan di "Asap / polusi udara"`.
  - In the 1:10 scene: if the replay Jaar page shows the fire line from Task 3, point at it.
  - Persiapan step 1 stays (the migration ended Jaar's mode daring, but the hourly run may start a new one).
- [ ] **Step 3:** `cd ../Proposal && sh build/ekspor.sh`. Check the PDF: ≤ 30 pages and < 10 MB, and `author` is `Muhammad Faiz Ghiffari`, using the same `fitz` check as the 3 Nov review.
- [ ] **Step 4:** Commit the Awasin repo changes from Tasks 1–5 if any are left. The Proposal folder isn't in git, so there's nothing to commit there.
- [ ] **Step 5: Hand over to the user:**
  - Retake Gambar 6–9. All four show the old label or old counts.
  - Rewrite the changed proposal sentences in their own words.
  - `git push` from konouness, then wait one hourly refresh and spot-check `/`, `/?putar=2026-08-09`, `/sekolah/30202502`.
