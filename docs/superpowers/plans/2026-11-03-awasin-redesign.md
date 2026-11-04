# Awasin Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every Awasin page the "warning signage" look, instant loading feedback, and purposeful motion, without changing any on-screen wording.

**Architecture:** Almost all of it is CSS in `src/app/globals.css`: new tokens, signage components, keyframes. Markup changes are limited to adding class names, wrapper elements, `aria-busy`, and `loading.tsx` skeleton files. Level colors move from inline styles to `lvl-0`…`lvl-3` classes that read CSS tokens. The map page moves into a `(peta)` route group so it can have its own loading skeleton without the other pages inheriting it. The URL stays `/`.

**Tech Stack:** Next.js 15.5 app router, React 19.1 (`useFormStatus` from `react-dom`), plain CSS (`@property`, `clip-path`, `repeating-linear-gradient`), Leaflet 1.9 `divIcon`, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-03-awasin-redesign-design.md`

## Global Constraints

- No comments in any code, including `ponytail:` markers (project rule, 2026-10-10).
- No visible copy changes. Uppercase only through CSS `text-transform`. The guard test from Task 0 must pass after every task.
- No new npm dependencies.
- Do not edit `src/lib/status.ts` labels or `src/app/layout.tsx` metadata (the later Kejelasan + Sumatra plan changes them). Do not edit `docs/superpowers/plans/2026-11-03-awasin-kejelasan-sumatra.md`.
- Level hexes stay exactly `#2e7d32 / #f9a825 / #ef6c00 / #c62828`, so the CSS tokens `--l0..--l3` keep matching `LEVEL_COLOR`.
- Animate only `transform`, `opacity`, `clip-path`. The single exception is the `@property --n` count-up. No `backdrop-filter`, no `will-change`.
- Durations: feedback 100–200 ms, entrances 200–350 ms, count-up/chart ≤ 600 ms. Easing token `--ease: cubic-bezier(.2,.8,.2,1)`. No overshoot.
- Infinite animations only for: level-3 marker pulse, live dot, skeleton shimmer, spinners.
- The existing `@media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }` stays. Every animated element's final state must be its non-animated style (use `animation-fill-mode: both` with `from` keyframes only).
- Touch targets ≥ 44 px, `:focus-visible` outline stays, `role="status"` / `role="alert"` stay.
- Work on branch `redesign`. Commit per task. Never push. Merging and pushing to `main` (which deploys on Vercel, from the konouness account) wait for the user's go.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Reduced motion leaves something invisible.** An element that starts at `opacity: 0` in a keyframe must show fully when animations are off. Expected: every page reads normally. Pinned in Task 7, Step 4 (Chrome emulation pass).
2. **Copy drift.** A restyle swaps or drops a string the video script quotes. Expected: none change. Pinned by `tests/ui/copy.test.ts` (Task 0), run in every task.
3. **360 px phone.** Long school names in the status board or list, a three-link nav ("Sekolah saya", "Kirim laporan", "Keluar"), or the Dinas tables overflow the page sideways. Expected: no horizontal page scroll, tables scroll inside their box. Pinned in Task 7, Step 3.
4. **Map jank on the replay day.** `?putar=2026-08-09` draws 5,992 fire dots on canvas, plus the tile filter and level-3 pulses. Expected: pan and zoom stay smooth on the presenting laptop. Pinned in Task 7, Step 5 (Performance recording).
5. **Wrong skeleton.** After the route-group move, `/login`, `/lapor` and `/s/[npsn]/absen` must show the generic skeleton, not the map one, and `/` must still render the map page. Pinned in Task 2, Step 6.

---

### Task 0: Branch, spec, copy guard

**Files:**
- Create: `tests/ui/copy.test.ts`
- Add: `docs/superpowers/specs/2026-11-03-awasin-redesign-design.md`, this plan

- [ ] **Step 1:** `git switch -c redesign`. The pending `M TODO.md` and the untracked kejelasan plan stay as they are: do not stage them.
- [ ] **Step 2: Write the guard test.** It reads every file under `src/` (`readdirSync('src', { recursive: true })`, `.ts`/`.tsx` only) into one string and asserts each of these is included:

```ts
const QUOTED = [
  'Belajar daring', 'Masuk normal', 'Tunda jam masuk', 'Data historis', 'Bukan data hari ini.', 'Langsung', 'Putar ulang: 9 Agu',
  'Apa yang dilakukan sekolah hari ini', 'sekolah di', 'titik api (48 jam)', 'Memuat peta…', 'Lihat detail sekolah',
  'Masuk', 'Keluar', 'Sekolah saya', 'Kirim laporan', 'Dasbor dinas', 'Masuk sebagai Sekolah', 'Masuk sebagai Dinas Pendidikan',
  'Laporan lapangan', 'Jarak pandang (meter)', 'Tercium bau asap', 'Siswa sakit atau terdampak hari ini', 'Foto (opsional)',
  'Mengirim…', 'Laporan terkirim ke dinas.', 'Mode darurat', 'Aktifkan mode daring', 'Mode daring aktif', 'Akhiri mode daring',
  'absen kesehatan', 'Absen kesehatan', 'Nama siswa', 'Kelas', 'Kondisi hari ini', 'Kirim absen',
  '24 jam ke depan', 'Dapatkan peringatan', 'Ikuti di Telegram', 'Laporan lapangan terbaru', 'Hanya yang tidak terdeteksi satelit',
  'Draf surat edaran', 'Kabupaten/kota', 'Buat draf surat edaran', 'Menyusun draf…', 'Draf AI, periksa sebelum ditandatangani',
];
```

Test name: `'every string the demo script quotes is still in src'`. Report the missing ones in the failure message.
- [ ] **Step 3:** Run `npx vitest run tests/ui/copy.test.ts`. Expected: PASS. It is a guard, so it passes from the start and must keep passing.
- [ ] **Step 4:** Commit the test, the spec and this plan: `docs: redesign spec, plan, copy guard`.

### Task 1: Signage foundation (tokens, type, topbar, buttons, banners, panels)

**Files:**
- Modify: `src/app/globals.css` (the token block and all base component rules), `src/components/Topbar.tsx`

**Interfaces:**
- Produces (CSS classes later tasks use): `lvl-0`…`lvl-3` (each sets `--c` to `var(--lN)` and `--on` to `var(--on-lN)`), `panel`, `panel alert` (striped header), `stripes` (the hazard gradient as a utility), `plate` (small solid label: `background: var(--c); color: var(--on)`), `stamp` (success message), `enter` (staggered rise of direct children 1–6), `reveal` (fade + 6 px slide on mount), `fade-in`, `skel` and `skel-line` (shimmer bones), `sr-only`, `btn[aria-busy='true']` (spinner before the label).
- Produces tokens: `--paper`, `--ink`, `--surface`, `--muted`, `--line`, `--stripe-a` (yellow), `--stripe-b` (ink), `--ease`, `--dur-fast: 150ms`, `--dur-in: 260ms`.

- [ ] **Step 1:** Load `frontend-design:frontend-design` and `design-taste-frontend` and read them before writing the CSS. They set the art-direction bar. The spec's "visual system" section is the brief.
- [ ] **Step 2: Tokens.** Light: paper around `#f3f0e8`, surface `#ffffff`, ink around `#121212`, muted readable at 4.5:1 on paper. Dark (keep both existing selectors, `prefers-color-scheme` with `:root:not([data-theme='light'])`): paper/ink invert, `--l*` unchanged. Keep `--radius-s` at 3 px and `--radius-l` at 4 px. Keep the existing variable names that pages already use (`--bg`, `--surface`, `--ink`, `--muted`, `--line`, `--focus`, `--l*`, `--on-l*`, `--gutter`), and alias `--bg` to `--paper`.
- [ ] **Step 3: Type.** `h1, h2, .brand, nav, .btn, .chips a, .plate, th` use `var(--font-sign)` with `font-stretch: 75%`, weight 800, `text-transform: uppercase` and `letter-spacing: .02em`. h1 should be larger than today (clamp, around 2–2.6 rem). Body stays Atkinson at 17 px. Numbers: `font-variant-numeric: tabular-nums` on `td`, `.count`, `.board`.
- [ ] **Step 4: Topbar.** Ink background, paper text, 2 px bottom stripe band (`stripes`, 4 px tall, via `::after`). In `Topbar.tsx` add `<span className="mark" aria-hidden="true" />` before the "Awasin" text inside the brand link: a 14 px yellow square rotated 45°. Nav wraps on narrow screens without overflowing.
- [ ] **Step 5: Buttons.** `.btn` gets a 2 px ink border, radius 3 px, `box-shadow: 3px 3px 0 var(--ink)`. On `:active` it moves `translate(3px,3px)` and the shadow drops to none (`--dur-fast`). Ghost buttons keep a paper fill. In dark mode the shadow uses `--paper`, the inverted ink. `[aria-busy='true']::before` is a 14 px ring spinner (`border` + `rotate` keyframe, 700 ms linear infinite). `:disabled` drops to opacity .7 without the `progress` cursor fighting the spinner.
- [ ] **Step 6: Banners and panels.** `.banner` gets a solid surface with a 10 px `stripes` left edge (`border-image` or `::before`) and bold text. `.panel` is a surface box with a 2 px ink border and 16 px padding. `.panel.alert > h2:first-child` gets the stripes background with the heading set on an ink chip inside it. `.stamp` is a bordered green plate (`--l0` border, light green fill via `color-mix`) with a check (`::before` "✓") that animates `scale(.96)` → 1 plus opacity over 200 ms. `.error` is a red plate in the same shape.
- [ ] **Step 7: Motion utilities.** Keyframes `rise` (from `opacity:0; transform: translateY(8px)`), `fade` (from `opacity:0`), `reveal` (from `opacity:0; translateY(-6px)`), `shimmer` (`::after` highlight translateX −100% → 100%, 1.2 s infinite), `spin`, `pulse` (scale 1 → 1.9, opacity .55 → 0, 2 s infinite), `land` (from `clip-path: inset(0 0 100% 0); transform: translateY(-4px)`), `grow` (from `transform: scaleY(0)`). `.enter > :nth-child(n)` for n = 1..6 gets `animation: rise var(--dur-in) var(--ease) both` with delay `(n-1) * 40ms`. Children past the sixth get no animation.
- [ ] **Step 8:** Add class `enter` to the `<main>` of `/sekolah/[npsn]`, `/lapor`, `/login`, `/s/[npsn]/absen`, `/dinas`, and to the map page `<aside>`.
- [ ] **Step 9:** Run `npx vitest run && npm run lint && npm run build`. Expected: all pass. Run `npm run dev` and open `/login` and `/?putar=2026-08-09`: new topbar, buttons, and banner are visible, and nothing is unstyled.
- [ ] **Step 10:** Commit: `feat: signage foundation, tokens, topbar, buttons, banners`.

### Task 2: Loading skeletons

**Files:**
- Create: `src/components/Skeleton.tsx`, `src/app/loading.tsx`, `src/app/(peta)/loading.tsx`, `src/app/sekolah/[npsn]/loading.tsx`, `src/app/dinas/loading.tsx`
- Move: `src/app/page.tsx` → `src/app/(peta)/page.tsx` (`git mv`; its imports are all `@/…`, no edits needed)
- Modify: `src/components/MapLoader.tsx`, `src/app/globals.css`

**Interfaces:**
- Produces: `TopbarShell(): JSX.Element` (static ink bar with the brand mark and the text "Awasin", no session lookup) and `Bone({ h, w }: { h: number | string; w?: number | string }): JSX.Element` (a `div.skel` sized by inline style, `aria-hidden`) in `src/components/Skeleton.tsx`.

- [ ] **Step 1:** Implement `TopbarShell` and `Bone`. Every loading file wraps its bones in a container with `role="status"` and a visually hidden "Memuat…". That text is new but hidden, so the copy guard is unaffected.
- [ ] **Step 2: Shapes** (each mirrors the real page so nothing jumps when it arrives):
  - `app/loading.tsx` (generic: login, lapor, absen): `TopbarShell`, `.wrap` with an h1 bone (40 px × 60%), a muted-line bone, then 3 field bones of 64 px.
  - `(peta)/loading.tsx`: `.map-page` grid → `TopbarShell`, `.map-layout` with `.map-box` (`div.skel.map-skel`, a full-size block with a slow vertical scan line: a 2 px `::before` moving top → bottom with `translateY`, 2.4 s infinite) and `.side` holding the chips, h1, a status-board row of 4 tiles, and 8 list-row bones.
  - `sekolah/[npsn]/loading.tsx`: name bone, chips row, a 200 px sign bone with radius 4, then 3 hazard rows (label bone + 48 px bar bone).
  - `dinas/loading.tsx`: `.wrap` at max-width 1100, h1 bone, then 10 table-row bones of 44 px.
- [ ] **Step 3: Map loader.** The `loading` option of `dynamic()` in `MapLoader.tsx` renders the same `map-skel` block with the visible text "Memuat peta…" centered in it. Keep the exact string.
- [ ] **Step 4:** Shimmer and scan line both animate `transform` only, and both stop under reduced motion. The bones stay visible as flat blocks.
- [ ] **Step 5:** Run `npx vitest run && npm run lint && npm run build`. Expected: PASS. The build route list shows `/`, not `/(peta)`.
- [ ] **Step 6:** Run `npm run dev`. Check `curl -s localhost:3000/ | grep -c "Apa yang dilakukan sekolah hari ini"` prints at least 1. In Chrome DevTools (Network: Slow 4G), click from `/` to a school, open `/login` directly, and open `/dinas` after the demo Dinas login. Each shows its own skeleton, and `/login` never shows the map skeleton.
- [ ] **Step 7:** Commit: `feat: loading skeletons per page`.

### Task 3: Forms, buttons in flight, feedback (lapor, absen, login, emergency, SE draft trigger)

**Files:**
- Create: `src/components/SubmitButton.tsx`
- Modify: `src/app/lapor/ReportForm.tsx`, `src/app/s/[npsn]/absen/CheckinForm.tsx`, `src/app/login/LoginForm.tsx`, `src/app/login/DemoLogin.tsx`, `src/app/sekolah/[npsn]/EmergencyPanel.tsx`, `src/app/globals.css`

**Interfaces:**
- Produces: `SubmitButton({ children, className }: { children: React.ReactNode; className?: string })`, a `'use client'` component. It renders `<button type="submit">` and uses `useFormStatus()` from `react-dom` to set `disabled` and `aria-busy` while pending. The label does not change.

- [ ] **Step 1: Busy state everywhere.** Add `aria-busy={busy}` to the submit buttons in `ReportForm`, `CheckinForm`, and `LoginForm`, leaving their existing busy labels as they are. In `DemoLogin`, track which role was clicked (`useState<string | null>`) and set `aria-busy` only on that button. Both stay disabled while pending, and the "Masuk…" status line stays.
- [ ] **Step 2: Emergency panel.** Replace both `<button className="btn…" type="submit">` with `SubmitButton` (same class, same label). Give the inactive section `className="stack panel"` and the active one `className="stack panel alert"`.
- [ ] **Step 3: Choice tiles.** `.choice` tiles get a 2 px ink border and a 56 px minimum height. Selected (`[aria-pressed='true']`, `label:has(input:checked)`) uses an ink fill with paper text. `:active` scales to .98 over 100 ms. Native checkboxes and radios inside the tiles get `accent-color: var(--ink)` at 20 px.
- [ ] **Step 4: Conditional fields.** In `ReportForm`, wrap the asap fragment in `<div className="stack reveal">` and give the banjir field and angin fieldset the `reveal` class. In `CheckinForm`, give the Gejala fieldset `reveal`.
- [ ] **Step 5: Messages.** In both forms, change `<p className={msg.ok ? '' : 'error'} role="status">` to use `'stamp'` for ok. Keep the text and role.
- [ ] **Step 6: Login.** The demo buttons get an extra class `role-card`: full width, 72 px tall, left-aligned, with an arrow `::after` on the right. `<details>`/`<summary>` is styled as a bordered row.
- [ ] **Step 7:** Run `npx vitest run && npm run lint && npm run build`. Expected: PASS. In `npm run dev`, log in as the demo school, send a report with the demo photo, and check: the button shows a spinner, the "Laporan terkirim ke dinas." stamp appears, and switching Bencana slides the fields in. Then activate and end mode daring: the spinner shows on the button, and the panel turns striped and back.
- [ ] **Step 8:** Commit: `feat: form feedback, pending buttons, choice tiles`.

### Task 4: Map page status board and markers

**Files:**
- Modify: `src/app/(peta)/page.tsx`, `src/components/ReplayBar.tsx`, `src/components/Map.tsx`, `src/app/globals.css`

**Interfaces:**
- Consumes: `lvl-N`, `plate`, `enter` (Task 1).

- [ ] **Step 1: Status board.** Above the existing counts line, add `<div className="board" aria-hidden="true">` with one tile per entry of `counts`, worst action first (reverse of `ACTION_ORDER`). Each tile gets class `lvl-${ACTION_LV[a]}` with `const ACTION_LV: Record<Action, Level> = { normal: 0, kurangi_luar: 1, tunda_masuk: 2, pulang_awal: 2, daring: 3 }`. Inside: `<span className="count" style={{ ['--n' as string]: n }} />` and `ACTION_LABEL[a]`. The existing `<p className="small">` counts sentence stays unchanged below the board: it is what screen readers and the video script read.
- [ ] **Step 2: Count-up.** In CSS, `@property --n { syntax: '<integer>'; initial-value: 0; inherits: false; }`, `.count { counter-reset: n var(--n); animation: count 600ms var(--ease) both; }`, `.count::after { content: counter(n); }`, `@keyframes count { from { --n: 0; } }`. With animations off, it shows the final number.
- [ ] **Step 3: Board layout.** A grid with `repeat(auto-fit, minmax(110px, 1fr))`. Tiles use a solid `var(--c)` fill with `var(--on)` text, a 2 px ink border, the number in condensed 800 at about 2.4 rem, and the label in small caps that wrap.
- [ ] **Step 4: List rows.** Each `<li>` gets `className={`lvl-${s.level}`}`. The row link gets `box-shadow: inset 4px 0 var(--c)` and 12 px left padding. On hover and focus-visible the bar grows to 8 px over 150 ms. The text block keeps its current markup.
- [ ] **Step 5: Live dot.** In `ReplayBar`, give the "Langsung" link `className="live"` when `active` is null: an 8 px `--l3` dot `::before` with the `pulse` ring. Replay chips get a 2 px border and dated-tab styling. `aria-current` styling stays an ink fill.
- [ ] **Step 6: Map.** In CSS, `.map-box .leaflet-tile-pane { filter: grayscale(.85) contrast(1.05); }`. In `Map.tsx`, the `icon` function passes `className: s.level === 3 ? 'badge-icon pulse' : 'badge-icon'`. `.pulse::before` is an absolutely positioned 34 px ring in `--l3` running the `pulse` keyframe, behind the badge. The `.badge` keeps its current ring but gains a third outer `0 0 0 6px var(--ink)` hairline at 1 px. Popups get radius 3, a 2 px ink border, and the "Lihat detail sekolah" link styled as a small `.btn`.
- [ ] **Step 7:** Keep the jenjang legend a single `.map(...)` over one list expression (the later plan swaps that list). Restyle `.legend` items as small plates.
- [ ] **Step 8:** Run `npx vitest run && npm run lint && npm run build`. Expected: PASS. In `npm run dev` at 1920×1080, `/?putar=2026-08-09` shows the board tiles 8 / 30 / 6 / 29, worst first, counting up, with the map visible without page scroll. The 8 daring markers pulse, and the "Data historis" banner is striped.
- [ ] **Step 9:** Commit: `feat: map status board, live dot, desaturated map, danger pulse`.

### Task 5: School page warning plate and forecast

**Files:**
- Modify: `src/app/sekolah/[npsn]/page.tsx`, `src/components/Sparkline.tsx`, `src/app/globals.css`

- [ ] **Step 1: Plate.** Delete `SIGN_FG` and the inline `--sign-bg`/`--sign-fg` style. The section gets `className={`sign lvl-${top}`}`. Add a first child `<p className="sign-tab">Level {top} · {LEVEL_LABEL[top]}</p>` (an ink tab with paper text, condensed caps, overlapping the plate's top edge). `.sign` uses `background: var(--c); color: var(--on)`, a 3 px ink border, and radius 4. `.sign .action` gets `text-transform: uppercase` and `font-stretch: 62%`. Any `.sign > p` after `.cause` gets a 6 px top margin and needs no class, so the later "Naik satu level…" line fits without new CSS.
- [ ] **Step 2: Land.** `.sign` runs `land` (320 ms, `--ease`, `both`). `.sign-tab` runs `rise` with a 120 ms delay. Switching replay chips remounts the page, so the plate lands again. That is intended.
- [ ] **Step 3: Forecast rows.** The `section[aria-label="Prakiraan 24 jam"]` gets `counter-reset: hz`. Each `.hazard` gets `counter-increment: hz` and a `header::before` with `counter(hz, decimal-leading-zero)` in a condensed ink box. The level `.lv` in each header becomes a `plate` with class `lvl-${levels[h]}` in place of the inline dot style.
- [ ] **Step 4: Bars grow.** In `Sparkline.tsx`, each `<rect>` gets `className="bar"` and `style={{ ['--i' as string]: i }}`. CSS: `.bar { transform-box: fill-box; transform-origin: bottom; animation: grow 300ms var(--ease) both; animation-delay: calc(var(--i) * 8ms); }`. A 24-bar chart finishes in ≤ 500 ms.
- [ ] **Step 5:** The non-owner "Sekolah sedang belajar daring" paragraph keeps its `.banner` (now striped). "Ikuti di Telegram" keeps `.btn`. The `Dapatkan peringatan` section gets `className="stack panel"`.
- [ ] **Step 6:** Run `npx vitest run && npm run lint && npm run build`. Expected: PASS. In `npm run dev`, `/sekolah/30202502?putar=2026-08-09` shows a red plate with "BELAJAR DARING", the tab "Level 2 · Siaga", the cause line, and bars that grow. The live `/sekolah/30202502` shows the right level color. At 360 px the action text wraps inside the plate and doesn't overflow.
- [ ] **Step 7:** Commit: `feat: school warning plate, numbered forecast, growing bars`.

### Task 6: Dinas dashboard and AI draft

**Files:**
- Modify: `src/app/dinas/page.tsx`, `src/app/dinas/SeDraft.tsx`, `src/app/globals.css`

- [ ] **Step 1: Overview table.** Wrap it in `<div className="table-box">` (`max-height: 70dvh; overflow: auto;` with a 2 px ink border) in place of `scroll-x`, so the sticky header works and the reports are reachable without scrolling past 73 rows. `thead th` is sticky at `top: 0` with an ink background and paper text. Each `<tr>` gets `className={`lvl-${lv}`}`, the first `td` gets `box-shadow: inset 4px 0 var(--c)`, and the Rekomendasi `.lv` becomes a `plate`. Number columns get `className="num"` (right-aligned). The mode daring cell renders `<span className="plate stripes">Aktif</span>` when active and plain "Tidak" otherwise.
- [ ] **Step 2: Filters.** The filter `<nav className="row small">` becomes `<nav className="chips">`. Its links already set `aria-current`, and the chip styling picks that up.
- [ ] **Step 3: Match plates.** Replace the `MATCH_COLOR` dot with `<span className={`plate lvl-${MATCH_LV[r.match]}`}>` using `const MATCH_LV: Record<MatchResult, Level> = { cocok: 0, tidak_terdeteksi: 3, tidak_terkonfirmasi: 1 }`, and delete `MATCH_COLOR`. Photo thumbnails get radius 3 and a 2 px ink border.
- [ ] **Step 4: SE draft.** The section gets `className="stack panel"`. While `pending`, keep the `Menyusun draf…` status line and add `<div className="skel-letter" aria-hidden="true">` with 6 `skel-line` bones of varying width (100/92/96/60/88/40 %). The result wrapper gets `className="stack fade-in"`. The button gets `aria-busy={pending}`.
- [ ] **Step 5:** Run `npx vitest run && npm run lint && npm run build`. Expected: PASS. In `npm run dev` as the demo Dinas: the table scrolls inside its box with the header pinned, plates are colored, filters are chips, and "Buat draf surat edaran" shows the letter skeleton and then fades the draft in.
- [ ] **Step 6:** Commit: `feat: dinas table plates, sticky header, draft skeleton`.

### Task 7: Look-and-fix pass on the demo path

**Files:**
- Modify: whatever the review finds, usually `src/app/globals.css`

- [ ] **Step 1:** Load `impeccable` and `animation-performance`. Use `design-taste-frontend`'s inspector and screenshot loop through the Chrome tools (`claude-in-chrome`).
- [ ] **Step 2: 1920×1080.** Walk `../Proposal/TUTORIAL_VIDEO_DEMO.md` section 4 from "Peta putar ulang" to the Dinas draft on `npm run dev`. Screenshot every page and run the critique. Fix anything that looks templated, cramped, or inconsistent. Each click must show feedback within about 100 ms.
- [ ] **Step 3: 360×800.** Screenshot `/`, `/sekolah/30202502`, `/lapor`, `/login`, `/s/30202502/absen`, and `/dinas`. Check that there is no horizontal page scroll (`document.documentElement.scrollWidth <= innerWidth` via the javascript tool on each page), that the nav doesn't overflow, and that the touch targets are ≥ 44 px.
- [ ] **Step 4: Reduced motion.** Emulate `prefers-reduced-motion: reduce` in DevTools Rendering and revisit every page. Everything should be visible in its final state: board numbers show, the plate is shown, the bars are full height, the skeletons are flat.
- [ ] **Step 5: Performance.** Record a DevTools Performance trace of loading `/?putar=2026-08-09` and panning and zooming for 5 s, then of loading the school page. Expected: no long frames caused by animations, and animation work is compositor-only except the count-up. If the tile filter or pulses cost frames while panning, drop the pulse to opacity only first, then lower the filter.
- [ ] **Step 6: Dark mode.** One pass with dark emulation on `/` and the school page. Check that text contrast holds and the stripes still read.
- [ ] **Step 7:** Run `npx vitest run && npm run lint && npm run build`. Expected: PASS. Commit: `fix: redesign look-and-fix pass`.
- [ ] **Step 8: Hand off.** Report to the user with before/after screenshots. Merging `redesign` into `main` and pushing (from konouness) waits for their go. Next comes the Kejelasan + Sumatra plan, run on `main` after this merge. Proposal screenshots and the video wait until both plans are deployed.
