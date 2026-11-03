# Awasin Multi-Provinsi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Grow the prototype from 25 Kalteng schools to 73 schools across all of Kalimantan, Jawa, and Sulawesi (17 provinces: the 25 Kalteng schools plus 3 per other province) without breaking the free tier, the replay, or the published back-test. Scope changed 2 Nov 2026 from the six haze provinces; Sumatra is out of the prototype.

**Architecture:** Schools are data, so the scoring code does not change. Widen the FIRMS area to cover Jawa, Kalimantan and Sulawesi, add a `provinsi` column, seed 48 real Dapodik schools, let the map fit whatever schools exist, and trim replay fires to those near a school so the baked file stays small.

**Tech Stack:** Next.js 15, Supabase (Postgres + RLS), react-leaflet, Vitest, NASA FIRMS area API, Open-Meteo.

**Spec:** the decision recorded in `TODO.md` section 9 (added 1 Nov 2026, scope changed 2 Nov 2026 to Kalimantan + Jawa + Sulawesi): prototype multi-provinsi, national and ASEAN only as roadmap in the proposal.

## Global Constraints

- No comments in any code (project rule since 2026-10-10).
- Open-Meteo free tier is about 10,000 calls/day. Each school costs 2 calls per hourly refresh, so 48 calls/day; 73 schools use about 3,500. Hard ceiling in this plan: 150 schools.
- Only real schools from Dapodik (`https://referensi.data.kemdikbud.go.id`). Never invent an NPSN, name, or coordinate.
- The published back-test (25 Kalteng schools, 17/20/31 Aug numbers) must not change.
- UI copy stays in Bahasa Indonesia.
- FIRMS bbox order is `west,south,east,north`. The new value is `105,-9,127.5,6` (Banten to Sulawesi Utara, south coast of Jawa Timur to Kalimantan Utara).
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. A Dapodik school with zero, swapped, or out-of-area coordinates gets no hotspots and looks "safe". Pinned by the seed test in Task 2 (every school inside `FIRMS_BBOX`).
2. Someone adds more schools later and silently exhausts the Open-Meteo quota. Pinned by the seed test in Task 2 (at most 150 schools).
3. Rerunning `scripts/backtest.mts` after expansion changes the published numbers. Pinned by the Kalteng filter and its grep check in Task 2.
4. The map with zero or one school (fresh DB, or a filtered view) must not crash or zoom to max. Pinned by the `mapView` test in Task 3.
5. A dry-season replay day with thousands of fires across Kalimantan and Sulawesi makes `data.json` too big. Pinned by the `firesNear` test and the size check in Task 4.

---

### Task 0: Precondition

- [x] **Step 1: Commit the pending 1 Nov work first**

`git status` shows uncommitted changes to `src/risk/score.ts`, its tests, `docs/backtest/*`, `docs/sources.md`, `src/replay/data.json`, `TODO.md`. They are the SE 20/2026 rule change. Commit them as their own commit (`feat: haze follows SE Mendikdasmen 20/2026`) before starting, so this plan's diff stays separate. Run `npm test` first; expected: all pass.

### Task 1: Widen the FIRMS area

**Files:**
- Modify: `src/sources/firms.ts:19-23`
- Test: `tests/sources/parse.test.ts`

**Interfaces:**
- Produces: `export const FIRMS_BBOX = { west: 105, south: -9, east: 127.5, north: 6 } as const` in `src/sources/firms.ts`. `firmsUrl` builds its area from it.

- [x] **Step 1: Write the failing test** in `tests/sources/parse.test.ts`

```ts
test('firms area covers Jawa, Kalimantan and Sulawesi', () => {
  expect(FIRMS_BBOX).toEqual({ west: 105, south: -9, east: 127.5, north: 6 });
  expect(firmsUrl('K')).toContain('/VIIRS_NOAA21_NRT/105,-9,127.5,6/2');
});
```

Add `FIRMS_BBOX` to the existing import from `../../src/sources/firms`.

- [x] **Step 2: Run it, expect FAIL** (`FIRMS_BBOX` is not exported)

Run: `npx vitest run tests/sources/parse.test.ts`

- [x] **Step 3: Export `FIRMS_BBOX` and build the URL area from it** as `${west},${south},${east},${north}`.

- [x] **Step 4: Run it, expect PASS**, including the existing `firms url takes the two days before` test.

- [x] **Step 5: Commit** `feat: FIRMS area covers Jawa, Kalimantan and Sulawesi`

### Task 2: `provinsi` column, real schools, back-test guard

**Files:**
- Create: `supabase/migrations/20261102000001_provinsi.sql`
- Modify: `supabase/seed.sql` (school insert and the Dinas demo name)
- Modify: `scripts/backtest.mts:7`
- Create: `tests/seed.test.ts`

**Interfaces:**
- Consumes: `FIRMS_BBOX` from Task 1.
- Produces: `public.schools.provinsi text not null`, used by Task 3 (`page.tsx`) and the back-test filter.

- [x] **Step 1: Write the failing test** `tests/seed.test.ts`

Read `../supabase/seed.sql` the same way `parse.test.ts` reads fixtures. Match school rows with
`/\('(\d{8})', '([^']+)', (-?[\d.]+), (-?[\d.]+), '([^']+)', '([^']+)'\)/g`
(npsn, name, lat, lon, kabupaten, provinsi).

```ts
test('every seeded school is real-shaped, inside the FIRMS area, and within quota', () => {
  expect(rows.length).toBeGreaterThanOrEqual(73);
  expect(rows.length).toBeLessThanOrEqual(150);
  expect(new Set(rows.map((r) => r.npsn)).size).toBe(rows.length);
  for (const r of rows) {
    expect(r.lat).toBeGreaterThan(FIRMS_BBOX.south); expect(r.lat).toBeLessThan(FIRMS_BBOX.north);
    expect(r.lon).toBeGreaterThan(FIRMS_BBOX.west); expect(r.lon).toBeLessThan(FIRMS_BBOX.east);
    expect(r.lat).not.toBe(0); expect(r.lon).not.toBe(0);
  }
  expect(new Set(rows.map((r) => r.provinsi))).toEqual(new Set(['Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara', 'Banten', 'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur', 'Sulawesi Utara', 'Gorontalo', 'Sulawesi Tengah', 'Sulawesi Barat', 'Sulawesi Selatan', 'Sulawesi Tenggara']));
  expect(rows.filter((r) => r.provinsi === 'Kalimantan Tengah')).toHaveLength(25);
});
```

- [x] **Step 2: Run it, expect FAIL** (rows have 5 columns, so 0 matches)

Run: `npx vitest run tests/seed.test.ts`

- [x] **Step 3: Migration**

`alter table public.schools add column provinsi text not null default 'Kalimantan Tengah';`

- [x] **Step 4: Pick the real schools**

From `https://referensi.data.kemdikbud.go.id`, take 3 SD Negeri in each of the 16 other provinces (48 schools). Use the default kabupaten below; swap it for another only if it has no school with usable coordinates.
- Kalimantan Barat: Kubu Raya · Kalimantan Selatan: Banjar · Kalimantan Timur: Kutai Kartanegara · Kalimantan Utara: Bulungan
- Banten: Pandeglang · DKI Jakarta: Jakarta Timur · Jawa Barat: Bandung · Jawa Tengah: Grobogan · DI Yogyakarta: Gunungkidul · Jawa Timur: Probolinggo
- Sulawesi Utara: Minahasa · Gorontalo: Gorontalo · Sulawesi Tengah: Sigi · Sulawesi Barat: Mamuju · Sulawesi Selatan: Maros · Sulawesi Tenggara: Konawe

Copy NPSN, name (uppercase, as Dapodik shows it), lintang, bujur and kabupaten exactly. Skip any school whose coordinates are empty or zero, or fall outside its kabupaten on a map. If the site blocks automated access, stop and ask the user to export the rows. Do not guess.

- [x] **Step 5: Seed**

Add `provinsi` to the insert column list and to every row: `'Kalimantan Tengah'` for the existing 25, the real province for the new ones. Add `provinsi = excluded.provinsi` to the `on conflict` update. Change the Dinas demo name from `'Dinas Pendidikan Kalimantan Tengah'` to `'Dinas Pendidikan (akun demo)'`.

- [x] **Step 6: Back-test guard**

In `scripts/backtest.mts:7`, add `.eq('provinsi', 'Kalimantan Tengah')` before `.order('npsn')`.
Check: `grep -n "provinsi" scripts/backtest.mts` prints that line.

- [x] **Step 7: Run tests, expect PASS**

Run: `npm test`

- [x] **Step 8: Commit** `feat: schools across Kalimantan, Jawa, Sulawesi`

### Task 3: Map fits the schools, copy says provinces

**Files:**
- Create: `src/lib/mapView.ts`
- Modify: `src/components/Map.tsx:17`
- Modify: `src/app/page.tsx:21,49` and its `Row` type
- Modify: `src/app/layout.tsx:10`, `docs/spec.md:44`, `README.md` (any "Kalimantan Tengah" scope line)
- Test: `tests/lib/mapView.test.ts`

**Interfaces:**
- Consumes: `provinsi` from Task 2.
- Produces: `mapView(points: { lat: number; lon: number }[]): { bounds: [[number, number], [number, number]] } | { center: [number, number]; zoom: number }`

- [x] **Step 1: Write the failing test**

```ts
test('no schools falls back to Kalteng', () => { expect(mapView([])).toEqual({ center: [-1.9, 113.4], zoom: 7 }); });
test('one school centers on it', () => { expect(mapView([{ lat: -2, lon: 113 }])).toEqual({ center: [-2, 113], zoom: 9 }); });
test('many schools give their bounding box', () => {
  expect(mapView([{ lat: 1, lon: 101 }, { lat: -3, lon: 114 }, { lat: 0, lon: 109 }])).toEqual({ bounds: [[-3, 101], [1, 114]] });
});
```

- [x] **Step 2: Run it, expect FAIL**

Run: `npx vitest run tests/lib/mapView.test.ts`

- [x] **Step 3: Implement `mapView`** in `src/lib/mapView.ts` (no leaflet import, so it runs in Vitest).

- [x] **Step 4: Use it in `Map.tsx`**

Spread `mapView(schools)` into `<MapContainer>` in place of the fixed `center`/`zoom`. Pass `boundsOptions={{ padding: [24, 24] }}`.

- [x] **Step 5: Copy**

- `page.tsx`: select `provinsi`, add it to `Row`, and render `{rows.length} sekolah di {new Set(rows.map((r) => r.provinsi)).size} provinsi, prakiraan 6 jam ke depan.`
- `layout.tsx` description: `'Peringatan dini asap, banjir, dan angin kencang untuk sekolah di Kalimantan, Jawa, dan Sulawesi.'`
- `spec.md:44`: `- Wilayah prototipe: 17 provinsi di Kalimantan, Jawa, dan Sulawesi, 73 sekolah contoh. Back-test tetap 25 sekolah Kalteng.`

- [x] **Step 6: Run checks, expect PASS**

Run: `npm test && npm run lint && npm run build`

- [x] **Step 7: Commit** `feat: map fits all schools, copy names provinces`

### Task 4: Replay stays small, then re-bake

**Files:**
- Modify: `src/replay/snapshot.ts`
- Modify: `scripts/bake-replay.mts:21-25` (delete the Kalteng-box fallback)
- Modify: `src/replay/data.json` (regenerated)
- Test: `tests/replay/replay.test.ts`

**Interfaces:**
- Produces: `export function firesNear(fires: Point[], schools: Point[], km: number): Point[]` in `src/replay/snapshot.ts`. Uses `distanceKm` from `src/risk/geo.ts`. `snapshotAt` returns only fires within 100 km of a school. Scoring still uses the full hotspot list.

- [x] **Step 1: Write the failing test** in `tests/replay/replay.test.ts`

```ts
test('firesNear keeps only fires close to a school', () => {
  const school = { lat: -2.2, lon: 113.9 };
  const near = { lat: -2.3, lon: 114.0 };
  const far = { lat: 1.0, lon: 101.0 };
  expect(firesNear([near, far], [school], 100)).toEqual([near]);
  expect(firesNear([near], [], 100)).toEqual([]);
});
```

- [x] **Step 2: Run it, expect FAIL**

Run: `npx vitest run tests/replay/replay.test.ts`

- [x] **Step 3: Implement `firesNear`, use it in `snapshotAt` with 100 km, and delete the `json.length > 1_000_000` block in `bake-replay.mts`.**

- [x] **Step 4: Run tests, expect PASS**

Run: `npm test`

- [x] **Step 5: Apply to production (ask the user first; this writes to the live Supabase project)**

```bash
npx supabase db push
psql "$SUPABASE_DB_URL" -c "set app.demo_password = '$DEMO_PASSWORD'" -f supabase/seed.sql
```

Expected: no errors. `select provinsi, count(*) from schools group by 1` shows 17 rows, Kalimantan Tengah = 25.

- [x] **Step 6: Re-bake**

Run: `npx tsx --env-file=.env.local scripts/bake-replay.mts`
Expected: each day prints 73 `sekolah`; the last line prints `data.json` under 1000 KB.

- [x] **Step 7: Run tests, expect PASS** (the existing `the haze shows up on 9 Aug` and `>= 20 schools` checks still hold)

Run: `npm test`

- [x] **Step 8: Write down the new replay counts**

Open `/?putar=2026-08-09` locally. Copy the new totals ("N masuk normal, N tunda jam masuk, N belajar daring") into `../Proposal/TUTORIAL_VIDEO_DEMO.md` where it says `[angka setelah re-bake]`.

- [x] **Step 9: Commit** `feat: replay covers Kalimantan, Jawa, Sulawesi`

The push stays with the user (konouness account).
