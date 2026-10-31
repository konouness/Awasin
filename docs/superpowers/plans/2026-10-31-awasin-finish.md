# Awasin Finish (penyisihan) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the penyisihan build: approved cuts, replay of the 9–11 Aug 2026 haze, a back-test chart, cited thresholds, check-in privacy, and a Gemini SE draft for Dinas.

**Architecture:** Replay is baked offline. A script runs the existing scoring (`buildForecasts`, `statusFrom`) on archived Open-Meteo and FIRMS data and writes one JSON file the pages read when `?putar=<date>` is set, so there's no new table and the live pipeline doesn't change. The back-test reuses the same snapshot function across 1–20 Aug. Privacy and the SE draft are a migration and a server action.

**Tech Stack:** Next.js 15 App Router, Supabase (Postgres RLS, pg_cron), Vitest, tsx scripts, Python matplotlib (chart only), Gemini REST API.

**Spec:** `docs/spec.md` and `TODO.md` (the to-do list is the working spec for this plan).

## Global Constraints

- Deadline penyisihan: **8 Nov 2026** (extended from 31 Oct). Order below = priority if time runs short.
- **No comments in any code**, including `ponytail:` markers (Kulyeah rule, 2026-10-10).
- **Git: commit locally only. Never push** until the user says so (decision 2026-10-31).
- Rp 0 running cost; no new paid service. No new npm dependency.
- Every cited source 2021 or newer, 2020 absolute floor. Older → stop and ask.
- Approved cuts only: task board, web-push, wind cap. **Keep** both sakit columns and **all** jenjang badges.
- UI copy in Bahasa Indonesia. Replay must always show the banner `Data historis` so nobody mistakes it for live data.
- Gemini gets totals only: never student names, check-in rows, or report notes.
- Scripts run as `npx tsx --env-file=.env.local scripts/<name>.mts`. Tests: `npx vitest run` (37 passing at plan time). DB tests: `sh scripts/test-db.sh`.

## Review Focus

1. Replay date param that's not one of the three days (`?putar=2026-13-99`, `?putar=`). Should fall back to live, not crash. Test in Task 5.
2. A school in the DB that's missing from the replay snapshot (school added after baking). The school page in replay should say `Tidak ada data historis untuk sekolah ini`, not 404. Test in Task 5.
3. Gemini down, 503 "high demand" (seen on 2026-10-31), or the key missing. The button shows `Draf AI tidak tersedia, coba lagi nanti` and the page still works. Test in Task 9.
4. Dinas loses direct read of `health_checkins` but the `Sakit (absen)` column must still show counts. Test in Task 8.
5. Open-Meteo hours with `null` PM2.5 in the archive. `parseOpenMeteo` already maps null → 0, so the back-test must not report a false "normal" because of it. Count and print null hours in Task 6.

---

### Task 1: Commit the pending hotspot work

**Files:** the already-modified files in `git status` plus `src/lib/jenjang.ts`, `tests/lib/jenjang.test.ts`, `supabase/migrations/20261029000001_hotspots.sql`, `TODO.md`, `docs/spec.md`, this plan.

- [ ] **Step 1:** `npx vitest run`. Expected: 37 passed.
- [ ] **Step 2:** `npx tsc --noEmit`. Expected: no errors.
- [ ] **Step 3:** Commit locally (no `.DS_Store`): `git add src tests supabase/migrations TODO.md docs && git commit -m "feat: hotspot layer on map, jenjang badges"`. Do not push.

### Task 2: Cap wind at "tunda masuk"

**Files:** Modify `src/risk/score.ts` (`ACTIONS.angin`), `tests/risk/score.test.ts`.

**Interfaces:** Produces `actionFor('angin', 3) === 'tunda_masuk'`; other hazards unchanged.

- [ ] **Step 1: Failing test** in `tests/risk/score.test.ts`:

```ts
test('wind never asks for daring', () => {
  expect(actionFor('angin', 2)).toBe('tunda_masuk');
  expect(actionFor('angin', 3)).toBe('tunda_masuk');
  expect(recommend({ asap: 0, banjir: 0, angin: 3 })).toEqual({ action: 'tunda_masuk', hazard: 'angin' });
});
```

- [ ] **Step 2:** `npx vitest run tests/risk/score.test.ts`. Expected: FAIL (`daring`).
- [ ] **Step 3:** Set `angin: ['normal', 'kurangi_luar', 'tunda_masuk', 'tunda_masuk']`.
- [ ] **Step 4:** Run the full suite. Expected: all pass (`tests/notify/decide.test.ts` too; if a decide test relied on wind → daring, change it to asap).
- [ ] **Step 5:** `git commit -am "feat: wind tops out at tunda masuk"`

### Task 3: Remove the task board and web-push

**Files:**
- Delete: `src/app/s/[npsn]/tugas/`
- Modify: `src/app/sekolah/[npsn]/EmergencyPanel.tsx` (drop task form, list, `tasks` query, "membuka papan tugas" and the papan-tugas link), `src/app/sekolah/[npsn]/actions.ts` (delete `addTask`, `deleteTask`), `src/app/sekolah/[npsn]/page.tsx:66-69` (banner keeps only the absen link), `src/notify/announceText.ts` (drop the `Tugas:` line), `tests/notify/announce.test.ts`, `package.json`, `.env.example`, `docs/spec.md` (S7 line and Rp 0 line: remove web push / VAPID / papan tugas).
- Keep: the `tasks` and `push_subscriptions` tables (no migration; the RLS test still reads them).

- [ ] **Step 1: Update test** in `tests/notify/announce.test.ts`: replace the `/tugas` expectation with `expect(t).not.toContain('/tugas');` and keep the absen and cause assertions.
- [ ] **Step 2:** Run it. Expected: FAIL.
- [ ] **Step 3:** Make the edits listed above. `npm uninstall web-push @types/web-push`. Remove `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` from `.env.example`; add `GEMINI_API_KEY=` there.
- [ ] **Step 4:** `grep -rn "tugas\|web-push\|VAPID" src docs/spec.md .env.example package.json`. Expected: no hits. `npx vitest run && npx tsc --noEmit`. Expected: pass.
- [ ] **Step 5:** `git add -A src tests package.json package-lock.json .env.example docs/spec.md && git commit -m "chore: drop task board and web push"`

### Task 4: Fetchers take a past date

**Files:** Modify `src/sources/openMeteo.ts`, `src/sources/firms.ts`. Test: `tests/sources/parse.test.ts`.

**Interfaces (produces):**
- `openMeteoUrls(schools: Point[], day?: string): { forecast: string; air: string }`. Without `day`, the URLs are exactly today's (`past_days=1&forecast_days=2`, `api.open-meteo.com`). With `day` (`YYYY-MM-DD`), the forecast host is `historical-forecast-api.open-meteo.com/v1/forecast` and both URLs carry `start_date=<day-1>&end_date=<day+1>` instead of `past_days/forecast_days`.
- `fetchOpenMeteo(schools, day?: string)`: same return as today.
- `firmsUrl(key: string, day?: string): string`. Without `day`, unchanged. With `day`, it appends `/<day-2>` to the `/2` range (FIRMS returns DATE..DATE+1, i.e. the 48 h before 06.00 WIB on `day`).
- `fetchHotspots(day?: string)`.

- [ ] **Step 1: Failing tests:**

```ts
test('open-meteo urls switch to archive for a past day', () => {
  const live = openMeteoUrls([{ lat: -2.2, lon: 113.9 }]);
  expect(live.forecast).toContain('api.open-meteo.com'); expect(live.forecast).toContain('past_days=1');
  const past = openMeteoUrls([{ lat: -2.2, lon: 113.9 }], '2026-08-09');
  expect(past.forecast).toContain('historical-forecast-api.open-meteo.com');
  expect(past.forecast).toContain('start_date=2026-08-08&end_date=2026-08-10');
  expect(past.air).toContain('start_date=2026-08-08'); expect(past.air).not.toContain('past_days');
});
test('firms url takes the two days before', () => {
  expect(firmsUrl('K')).toMatch(/\/2$/);
  expect(firmsUrl('K', '2026-08-09')).toMatch(/\/2\/2026-08-07$/);
});
```

- [ ] **Step 2:** Run. Expected: FAIL (not exported).
- [ ] **Step 3:** Implement. Date math with `new Date(day + 'T00:00:00Z')` ± 86400000 and `toISOString().slice(0, 10)`.
- [ ] **Step 4:** Run the full suite. Expected: pass. Live check: `curl` the archive forecast URL for one school on 2026-08-09 and confirm HTTP 200 with `precipitation` present.
- [ ] **Step 5:** Commit `feat: fetchers accept a past day`.

### Task 5: Replay mode (9 / 10 / 11 Aug 2026, 06.00 WIB)

**Files:**
- Create: `src/replay/snapshot.ts`, `scripts/bake-replay.mts`, `src/replay/data.json` (generated), `src/replay/replay.ts`, `src/components/ReplayBar.tsx`, `tests/replay/replay.test.ts`
- Modify: `src/app/page.tsx`, `src/app/sekolah/[npsn]/page.tsx`, `src/app/globals.css`

**Interfaces:**
- Consumes: `fetchOpenMeteo(schools, day)`, `fetchHotspots(day)` (Task 4); `buildForecasts`, `statusFrom` from `src/pipeline/buildForecasts.ts`.
- Produces:
  - `snapshotAt(schools: (Point & { id: string; npsn: string })[], day: string): Promise<Snapshot>` where `at = <day>T06:00+07:00` and `Snapshot = { day: string; at: string; fires: [number, number][]; schools: Record<string /*npsn*/, { status: SchoolStatus; rows: ForecastRow[] }> }`. Fires are rounded to 4 decimals like `saveHotspots`.
  - `REPLAY_DAYS = ['2026-08-09', '2026-08-10', '2026-08-11'] as const`
  - `replayDay(param: string | undefined): Snapshot | null`, which returns null for anything not in `REPLAY_DAYS`.
  - `<ReplayBar active={string | null} base={string} />` renders chips `Langsung`, `Putar ulang: 9 Agu`, `10 Agu`, `11 Agu 2026`, linking `base?putar=<day>`, plus, when active, `<p className="banner" role="status">Data historis: kondisi {formatWIB(at)}. Bukan data hari ini.</p>`.

- [ ] **Step 1: Failing tests** in `tests/replay/replay.test.ts`:

```ts
test('unknown or empty day falls back to live', () => {
  expect(replayDay(undefined)).toBeNull(); expect(replayDay('')).toBeNull(); expect(replayDay('2026-13-99')).toBeNull();
});
test('baked days load and are 06.00 WIB', () => {
  for (const d of REPLAY_DAYS) { const s = replayDay(d)!; expect(s.at).toBe(new Date(`${d}T06:00:00+07:00`).toISOString()); expect(Object.keys(s.schools).length).toBeGreaterThanOrEqual(20); }
});
test('the haze shows up on 9 Aug', () => {
  const s = replayDay('2026-08-09')!;
  expect(Object.values(s.schools).some((x) => x.status.action !== 'normal')).toBe(true);
});
```

- [ ] **Step 2:** Run. Expected: FAIL (module missing).
- [ ] **Step 3:** Implement `snapshotAt` (no `server-only` import, so the script can use it). Write `scripts/bake-replay.mts`: load schools `id, npsn, lat, lon` with the service-role client from `.env.local`, call `snapshotAt` for each `REPLAY_DAYS` entry, write `src/replay/data.json` (keep it under 1 MB; filter fires to the Kalteng box `110.5,-3.6,116,0.8` if larger). Run: `npx tsx --env-file=.env.local scripts/bake-replay.mts`. Expected: prints per day the count of schools per action.
- [ ] **Step 4:** Implement `replay.ts` (static `import data from './data.json'`) and `ReplayBar`. In `page.tsx` read `searchParams.putar`; when a snapshot exists, take fires, `action` and `levels` from it instead of `school_status`/`hotspots`, hide the stale banner, and show `Diperbarui` as the snapshot time. In the school page, use the snapshot's `status` and `rows` (sparklines start at `at`), hide `EmergencyPanel` and the daring banner, and if the npsn is missing show `Tidak ada data historis untuk sekolah ini.` Keep `?putar` on map → school links.
- [ ] **Step 5:** `npx vitest run && npx tsc --noEmit`. Then `npm run dev`, open `/?putar=2026-08-09` and `/sekolah/<npsn>?putar=2026-08-09` at 375 px width. Expected: banner visible, rings not all green. Print the three days' action counts for the user to choose the video's day.
- [ ] **Step 6:** Commit `feat: replay mode for 9-11 Aug 2026 haze`.

### Task 6: Back-test chart and SE source

**Files:** Create `scripts/backtest.mts`, `scripts/backtest_chart.py`, outputs `docs/backtest/backtest.csv`, `docs/backtest/backtest.png`, `docs/backtest/README.md`.

**Interfaces:** Consumes `snapshotAt` (Task 5).

- [ ] **Step 1:** `backtest.mts` loops `day` from 2026-08-01 to 2026-08-20, calls `snapshotAt`, and writes CSV columns `day,pm25_max_06wib,n_normal,n_kurangi_luar,n_tunda_masuk,n_pulang_awal,n_daring,pm25_null_hours`. Throttle FIRMS to 1 call per 2 s.
- [ ] **Step 2:** Run it. Expected: 20 rows; print the first day with any `tunda_masuk` and the first with any `daring`.
- [ ] **Step 3:** Search the news (2026 sources) for the SE/closure date and issuer behind "571.338 murid PJJ, 11 Agustus 2026". Record URL, outlet, publish date, and the exact sentence in `docs/backtest/README.md`. Stop and ask the user to approve the citation before it goes in the chart.
- [ ] **Step 4:** `backtest_chart.py` (matplotlib, A4-friendly 1600×900 PNG): stacked bars of schools per action by day, a PM2.5 line on a second axis, and a vertical line labelled `SE: <tanggal>`. Title: `Awasin vs. kejadian nyata, Kalteng Agustus 2026`. Run `python3 scripts/backtest_chart.py`. Expected: PNG exists, under 1 MB.
- [ ] **Step 5:** Write the key numbers in `docs/backtest/README.md`: lead time in days between Awasin's first `daring` and the SE, and school counts on that day. Commit `docs: back-test for Aug 2026 haze`.

### Task 7: Threshold sources on the school page

**Files:** Modify `src/lib/advice.ts`, `src/app/sekolah/[npsn]/page.tsx`. Create `docs/sources.md`.

- [ ] **Step 1:** Verify the PM2.5 cutoffs 55.5 / 150.5 / 250.5 µg/m³ against the ISPU PM2.5 table in PermenLHK P.14/MENLHK/SETJEN/KUM.1/7/2020, and check whether ISPU uses a 24-hour average while `levelAsap` uses hourly values. Verify rain cutoffs 50 / 100 / 150 mm/day against BMKG's categories (lebat, sangat lebat, ekstrem). Record the source URL and table in `docs/sources.md`. If a cutoff differs, or the averaging differs, stop and ask before changing `score.ts`.
- [ ] **Step 2:** Search for a 2026 Kemendikdasmen SE on haze and schools. If only the 2015 Kemendikbud SE exists, record that in `docs/sources.md` and ask before citing it.
- [ ] **Step 3:** Add `THRESHOLD_SOURCE: Record<Hazard, string>` to `advice.ts` (`asap: 'Ambang: ISPU KLHK (PermenLHK P.14/2020)'`, `banjir: 'Kategori hujan: BMKG'`, and for `angin`, the source found or `'Ambang: skala Beaufort'`). Render it as `<p className="small muted">` under each hazard on the school page.
- [ ] **Step 4:** `npx tsc --noEmit`, then a dev-server look. Commit `feat: show threshold sources`.

### Task 8: Check-in privacy (Dinas sees totals only)

**Files:** Create `supabase/migrations/20261101000001_checkin_privacy.sql`. Modify `supabase/tests/rls.sql`.

**Interfaces:** `dinas_overview(p_date)` keeps its signature and columns; it becomes `security definer`, keeping its existing `where is_dinas() or own school` filter.

- [ ] **Step 1: Failing DB test** in `rls.sql`, after the check-in block. As user `dddd` (dinas), `select count(*) from public.health_checkins` must be 0. As `dddd`, `select sick_checkins from public.dinas_overview(<WIB today>) where npsn = 'T0000001'` must be 1. As `aaaa`, its own school's check-in rows stay readable.
- [ ] **Step 2:** `sh scripts/test-db.sh`. Expected: FAIL (dinas still reads rows).
- [ ] **Step 3:** Migration: drop policy `"read own school or dinas"` on `health_checkins`; create `"read own school"` using `school_id = (select public.my_school_id())`; `create or replace function public.dinas_overview ... security definer set search_path = ''` with the same body. Re-run the revoke/grant lines. Apply: `npx supabase db push`.
- [ ] **Step 4:** `sh scripts/test-db.sh`. Expected: `rls ok`.
- [ ] **Step 5:** Commit `feat: dinas sees check-in totals only`.

### Task 9: "Buat draf surat edaran" for Dinas (Gemini)

**Files:** Create `src/se/draft.ts`, `src/app/dinas/actions.ts`, `src/app/dinas/SeDraft.tsx`, `tests/se/draft.test.ts`. Modify `src/app/dinas/page.tsx`.

**Interfaces (produces):**
- `type KabTotals = { kabupaten: string; schools: number; byAction: Record<Action, number>; reports: number; sick: number; emergencies: number }`
- `kabTotals(rows: Overview[]): KabTotals[]`: one entry per kabupaten, sorted by name. Export `Overview` from the dinas page or move it to `src/se/draft.ts`.
- `sePrompt(t: KabTotals, date: string): string`. In Bahasa Indonesia, it asks for a formal SE from Kepala Dinas Pendidikan to principals in that kabupaten, citing only the numbers given.
- `askGemini(prompt: string, fetchFn = fetch): Promise<string | null>`. POST `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent` with header `x-goog-api-key: process.env.GEMINI_API_KEY`. Returns null on a missing key, a non-200 status, or a thrown error. Timeout 30 s via `AbortSignal.timeout`.
- Server action `draftSE(kabupaten: string): Promise<{ ok: true; text: string } | { ok: false; text: 'Draf AI tidak tersedia, coba lagi nanti.' }>`, for the dinas role only.

- [ ] **Step 0:** Pick `MODEL`. On 2026-10-31 the key worked, but `gemini-flash-latest` returned 503 "high demand" and `gemini-2.5-flash`, `gemini-3.5-flash` and `gemini-3.8-flash` returned 404 with an empty body. Re-test with `curl` and use the first model that returns 200. Record it as a const in `draft.ts`.
- [ ] **Step 1: Failing tests:**

```ts
test('totals group by kabupaten and carry no names', () => {
  const t = kabTotals(fixtureRows);
  expect(t.map((x) => x.kabupaten)).toEqual(['Kapuas', 'Palangka Raya']);
  expect(t[1].byAction.daring).toBe(1); expect(t[1].sick).toBe(5);
  expect(sePrompt(t[1], '2026-08-09')).not.toContain('SDN 1 Palangka Raya');
});
test('gemini failure returns null', async () => {
  expect(await askGemini('x', async () => new Response('busy', { status: 503 }))).toBeNull();
  expect(await askGemini('x', async () => { throw new Error('net'); })).toBeNull();
});
```

`fixtureRows`: three `Overview` rows (two in Palangka Raya, one daring with `sick_reported` 3 + `sick_checkins` 2; one in Kapuas).
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement. `SeDraft` is a client component with a kabupaten `<select>`, a button `Buat draf surat edaran`, and a result `<textarea readOnly rows={14}>` under the heading `Draf AI, periksa sebelum ditandatangani`. Show `Menyusun draf…` while waiting.
- [ ] **Step 4:** `npx vitest run && npx tsc --noEmit`. Then, logged in as Dinas on the dev server, click the button once. Expected: a draft, or the unavailable message.
- [ ] **Step 5:** Commit `feat: AI draft of surat edaran for dinas`.

### Task 10: README, docs and TODO

**Files:** `README.md`, `docs/spec.md`, `docs/superpowers/plans/2026-10-20-awasin.md`, `TODO.md`.

- [ ] **Step 1:** README: what Awasin is (2 lines), setup (`.env.local` keys from `.env.example`, `npx supabase db push`, seed, Vault secrets for pg_cron, `scripts/set-webhook.mts`), replay and back-test commands, data attribution (Open-Meteo, NASA FIRMS, OSM), and demo account emails (no password in git).
- [ ] **Step 2:** Spec: record the cuts, replay, Gemini SE draft and privacy change, and replace "Tidak ada fitur yang dipotong" with the 2026-10-31 decision. Old plan: tick Tasks 1–9; strike the PWA and `demo-scenario.sql` parts of Task 10 and point to replay.
- [ ] **Step 3:** Tick the finished TODO items. Leave [You] items open.
- [ ] **Step 4:** Commit `docs: readme and spec match the build`. Still no push.

## Left for the user (not in this plan)

Add `GEMINI_API_KEY` to Vercel. Push from konouness when ready. Run the phone end-to-end check, the cron check, Supabase pause, Telegram webhook and demo logins. Confirm the new deadline hour and video rules on the ADIKARA website. Approve the SE citation (Task 6) and threshold findings (Task 7). The proposal and video belong to owner C.
