# Awasin redesign: warning signage + motion

Date: 3 Nov 2026. Status: draft, waiting for approval.

## Why

Awasin is shown twice, and both count equally: the recorded demo video (submitted by 8 Nov 2026) and the live click-through at the final (19 Nov 2026), likely on a projector. Today the app works but looks plain: flat cards, no motion, and plain text ("Memuat peta…") while pages and the map load. Every page is `force-dynamic`, so a click can sit for a second with no feedback, which reads as "broken" on a recording. The redesign has to make judges see a finished, serious emergency tool.

The redesign ships **before** the video is recorded. The proposal screenshots get retaken on the new look.

## Direction (the user's choice): warning signage

Light, loud and typographic. Each status reads like an official public warning sign (BMKG / BNPB / road hazard signage): huge condensed type, solid color blocks per level, hazard-stripe accents, hard edges, thick ink rules and a strong grid. The big status sign on the school page is the seed of this. The redesign carries that language to every page.

## Goals

1. A distinct, coherent visual identity on every page: map (`/`), school (`/sekolah/[npsn]`), report form (`/lapor`), login (`/login`), health check-in (`/s/[npsn]/absen`), Dinas dashboard (`/dinas`).
2. Instant feedback on every click that waits on the server: route loading skeletons, pending states on every submit button, a loading state for the map and the AI letter draft.
3. Motion that helps reading: the status sign lands, counts settle, the 24-hour bars grow, danger schools draw the eye on the map.
4. Looks right on a 1920×1080 projector/recording and on a 360 px-wide cheap Android phone.

## Non-goals

- No copy changes. Every visible string stays exactly as it is, so `../Proposal/TUTORIAL_VIDEO_DEMO.md` still matches word for word. Uppercase may be applied with CSS `text-transform` only; the underlying text is unchanged. (The separate 3 Nov "Kejelasan + Sumatra" plan does change some labels; that is its business, not this one's.)
- No data, scoring, routing, auth, or database changes.
- No new pages, no new features.
- No new npm dependencies. Motion is CSS (plus at most tiny client components that use React's own hooks).
- No View Transitions API (not stable in React 19.1 / Next 15.5). Skipped; add when React ships `<ViewTransition>` stable.

## Anti-goals (the user's own)

- **Gimmicky motion.** Nothing bounces, flies in from offscreen, or moves just to look busy. It is an emergency tool; motion is short, firm, and has a reason.
- **Slow or janky.** No stutter on the presenting laptop; no animation that makes clicking through the demo feel slower.
- **A worse phone view.** Teachers and parents use cheap Android phones. The mobile layout must be at least as usable as today.

## Constraints

- Stack stays: Next.js 15.5 app router, React 19.1, plain `src/app/globals.css`, Leaflet 1.9 via react-leaflet 5, fonts Archivo (variable, `wdth` axis already loaded) and Atkinson Hyperlegible.
- **No comments in any code** (project rule, 2026-10-10).
- UI copy stays Bahasa Indonesia and unchanged (see Non-goals).
- Level meaning and color order stay: 0 Aman green, 1 Waspada yellow, 2 Siaga orange, 3 Awas red (`LEVEL_COLOR` in `src/lib/status.ts`). Shades may be tuned for signage contrast, but each must keep text contrast ≥ 4.5:1 with its `--on-lN` color.
- Accessibility stays at least as good: visible `:focus-visible`, 44 px minimum touch targets, `role="status"` messages kept, `prefers-reduced-motion: reduce` turns all motion off (the existing global rule stays and must leave every page in its final, readable state).
- Motion animates only `transform`, `opacity`, and `clip-path`, with one exception allowed: the count-up numbers (a registered `@property` integer, tiny text). No `backdrop-filter` over the map. No `will-change` sprinkled around.
- Production writes (`git push` to `main`, which deploys on Vercel) wait for the user's go, from the konouness account only.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## What the user decided

- Both video and live final matter equally.
- Bold redesign, warning-signage direction (not the dark "command center" direction).
- Lands before the video is recorded.
- Anti-goals above.
- Described in text; no mockups wanted during design.

## The visual system (Claude's calls; builder may tune values)

**Surfaces.** Warm "printed bulletin" paper background (around `#f3f0e8`), white panels, near-black ink (around `#121212`). Hard edges: radius 2–4 px. Panels separated by 2 px ink rules rather than soft shadows. Buttons get a hard offset shadow (3 px, ink) that collapses when pressed.

**Type.** Archivo at condensed width (`font-stretch` ~62–75%) and weight 800–900 for the sign text, headings, counts, and nav, often uppercase with slight positive tracking. Atkinson Hyperlegible stays for body text and form inputs. Numbers use `font-variant-numeric: tabular-nums`.

**Hazard stripes.** A 45° yellow/black `repeating-linear-gradient`, used only where something is abnormal: the "Data historis" replay banner, the active "Mode daring aktif" panel, the stale-data banner, and "Aktif" in the Dinas table's mode daring column. Never as decoration on normal states.

**Topbar.** Solid ink bar, "Awasin" wordmark in condensed caps with a small yellow mark, nav links in condensed caps. On phones the nav stays on one line or wraps cleanly; nothing hides behind a menu.

**Map page.**
- Map tiles desaturated with a CSS filter on the Leaflet tile pane (around `grayscale(.85) contrast(1.05)`) so level rings and fire dots carry all the color.
- School markers keep the jenjang badge and the level-colored ring (the legend calls it "cincin"), restyled with a thicker ink outline. Level-3 markers get a slow expanding ring pulse (a pseudo-element, `transform` + `opacity`, ~2 s loop). This is the only infinite map motion.
- Sidebar becomes a status board: one tile per action present today (the existing `counts`), each tile with a big condensed number and its label, colored by severity, worst first. Numbers count up from 0 on load (~600 ms). The real number is always in the DOM for screen readers; the animated one is `aria-hidden`.
- School list rows get a left color bar for the level. Hover/focus widens the bar.
- The "Langsung" chip shows a small pulsing live dot when live data is on; replay chips look like dated tabs.

**School page.**
- The sign becomes a full-width warning plate: a black tab on top reading the level ("Level 2 · Siaga", built from the existing `LEVEL_LABEL` and level number, without new wording beyond what the cause line already says), the action in huge condensed caps, then cause and advice. On load the plate lands: clip-path wipe from top plus a slight settle, ~320 ms, ease-out.
- 24-hour section: each hazard is a numbered row (01/02/03) with its level chip. Sparkline bars grow from the baseline (`scaleY`, staggered a few ms per bar, whole chart done in ≤ 500 ms).
- Emergency panel: inactive is a plain bordered panel; active ("Mode daring aktif") gets the hazard-stripe header. The submit buttons show a pending spinner while the server action runs.
- "Ikuti di Telegram" is a full-strength button.

**Report form, check-in form, login.**
- Choice tiles (Bencana, Kondisi hari ini, Angin, Gejala) are big bordered tiles; selected = ink fill with paper text; press = scale 0.98 for ~100 ms.
- Conditional fields (asap / banjir / angin, gejala) fade and slide 6 px in when they appear.
- Submit buttons: spinner beside the existing busy text ("Mengirim…", "Memeriksa…", "Masuk…").
- Success messages ("Laporan terkirim ke dinas.", the check-in thanks) appear as a "stamp": bordered green plate with a check mark, scale 0.96 → 1 + fade, ~200 ms. Errors keep `.error` styling, red plate.
- Demo login buttons become two large role cards.

**Dinas dashboard.**
- Table restyled: ink header row (sticky within its scroll box), level color bar on each row's left edge, the Rekomendasi cell as a colored plate, "Aktif" as a striped chip, numbers tabular and right-aligned.
- Report filters become chips (same as replay chips).
- Report rows: match result as a colored plate ("Cocok" green, "Tidak terdeteksi satelit" red, "Tidak terkonfirmasi" yellow).
- AI draft: while pending, a letter-shaped skeleton (a few shimmering lines) under the existing "Menyusun draf…" status; when the draft arrives, the heading and textarea fade in.

**Loading (all pages).**
- Add `loading.tsx` for `/`, `/sekolah/[npsn]`, `/dinas`, `/lapor` with skeletons that match each page's real layout (no layout jump on arrival), and a shimmer (a `transform`-animated highlight, not `background-position`).
- Map loader replaces plain "Memuat peta…" with a skeleton of the map box (paper-gray block with a slow scan line), keeping the text "Memuat peta…" visible.

**Page entrance.** Main content blocks fade up 8 px, ~240 ms ease-out, staggered ~40 ms, capped at the first ~6 blocks so long lists don't trickle in.

**Dark mode.** Kept (the app already follows `prefers-color-scheme`). Paper and ink invert; level colors and stripes stay saturated. Secondary to light, which is what the projector and the video use.

## Motion rules

- Durations: 100–200 ms for feedback (press, toggle), 200–350 ms for entrances, ≤ 600 ms for count-up and chart growth. Easing: a firm ease-out (e.g. `cubic-bezier(.2,.8,.2,1)`) for entrances; no spring overshoot, no bounce.
- Infinite loops only for: level-3 map marker pulse, the live dot, skeleton shimmer, spinners.
- Everything is off under `prefers-reduced-motion: reduce`, and the final state must show without the animation (count-ups show the real number, the sign is visible, the bars are full height).
- Nothing delays interaction: elements are clickable while they animate in.

## Order with the "Kejelasan + Sumatra" plan

This redesign runs **first**. The plan `docs/superpowers/plans/2026-11-03-awasin-kejelasan-sumatra.md` is not edited now; the user updates it after the redesign lands. To keep that later step easy, the redesign:

- leaves `src/lib/status.ts` labels and `src/app/layout.tsx` metadata alone (that plan changes them);
- styles the school-page sign so any extra `<p>` inside it (that plan adds a "Naik satu level…" line under the cause) looks right with no further CSS;
- keeps the map page's jenjang legend as a single loop over a list, so swapping in `jenjangPresent(...)` stays a one-line change.

## What's left to the builder

- Exact hex values, durations within the ranges above, skeleton shapes.
- Whether the count-up uses CSS `@property` or a small client component, whichever is less code and correct under reduced motion.
- File layout of the CSS (one `globals.css` is fine).
- Use of the design and motion skills while building and reviewing: `frontend-design:frontend-design` / `design-taste-frontend` for the art direction pass, `impeccable` for critique, `animation-performance` for the jank check.

## How to verify

- `npm run build`, `npm run lint`, `npx vitest run` pass.
- Run the demo click path from `TUTORIAL_VIDEO_DEMO.md` section 4 on `npm run dev` with `?putar=2026-08-09`: every quoted string is still on screen, and every click shows feedback within 100 ms.
- Screenshots at 1920×1080 and 360×800 of every page, light mode, plus one dark-mode pass. The map page at 1920 must show the status board and the map without scrolling.
- Chrome DevTools Performance recording of the map page load and a school page load: no long frames caused by animation; animations show only composite (plus the small count-up paint).
- Reduced motion on: every page renders in its final state.

## After it ships (the user's tasks)

- Retake the proposal screenshots (BAB 7.1 map, others showing the app) on the new look.
- Record the video.
