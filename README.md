# Awasin

Awasin tells each school what to do today when haze, extreme rain or strong wind threatens: masuk normal, kurangi kegiatan luar, tunda jam masuk, pulang lebih awal, or belajar daring.
It turns satellite fire data, air quality and weather forecasts into a status per school, matches teachers' field reports against it, and runs an emergency mode (Telegram announcement and daily health check-in). Prototype region: 25 schools in Kalimantan Tengah. ADIKARA 2026, Inovasi Software.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill it in:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` from the Supabase project settings
   - `FIRMS_MAP_KEY` from https://firms.modaps.eosdis.nasa.gov/api/map_key/
   - `TELEGRAM_BOT_TOKEN`, `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` from @BotFather, plus a random `TELEGRAM_WEBHOOK_SECRET`
   - `CRON_SECRET` (random), `NEXT_PUBLIC_APP_URL` (the deployed URL)
   - `GEMINI_API_KEY` from Google AI Studio (free tier), used only for the surat edaran draft
   - `DEMO_PASSWORD`, the shared password of the demo accounts
   - `DEMO_LOGIN=1` turns on the one-click demo login on `/login`. Leave it empty outside the judging window.
   - `SUPABASE_DB_URL` (optional; without it the DB test runs through the Supabase CLI)
3. Link and migrate: `npx supabase link --project-ref <ref>` then `npx supabase db push`.
4. Seed the 25 schools and demo accounts (the password never goes in git):
   `psql "$SUPABASE_DB_URL" -c "set app.demo_password = '$DEMO_PASSWORD'" -f supabase/seed.sql`
5. In the Supabase SQL editor, store the two secrets the hourly pg_cron job reads:
   `select vault.create_secret('<app url>', 'app_url'); select vault.create_secret('<CRON_SECRET>', 'cron_secret');`
6. Point Telegram at the app: `npx tsx --env-file=.env.local scripts/set-webhook.mts`
7. Add the same env vars to Vercel. Vercel Hobby only builds pushes from the `konouness` account.

## Commands

- `npm run dev` runs the app locally.
- `npx vitest run` runs the unit tests. `sh scripts/test-db.sh` runs the RLS test inside a transaction that rolls back.
- `npx tsx --env-file=.env.local scripts/bake-replay.mts` rebuilds the replay data (`src/replay/data.json`) for 9, 10 and 11 Aug 2026 at 06.00 WIB. Open `/?putar=2026-08-09` to see it.
- `npx tsx --env-file=.env.local scripts/backtest.mts` then `python3 scripts/backtest_chart.py` rebuild the back-test in `docs/backtest/`.

## Demo accounts

With `DEMO_LOGIN=1`, `/login` shows "Masuk sebagai Sekolah" and "Masuk sebagai Dinas Pendidikan". No typing needed.
While it is on, anyone with the link can enter both accounts, including the Dinas report list. The demo school never sends Telegram announcements when its mode daring is switched on by hand.
Behind the buttons: `demo+30202502@awasin.id` (SD Negeri 1 Jaar) and `dinas@awasin.id`. Each of the 25 schools also has `demo+<npsn>@awasin.id`. The password is in the proposal, not in this repo.

## Data

- Weather and air quality: [Open-Meteo](https://open-meteo.com/) (CC BY 4.0, non-commercial use).
- Active fires: NASA FIRMS, VIIRS NOAA-21 NRT. We acknowledge the use of data and imagery from LANCE FIRMS operated by NASA's Earth Science Data and Information System (ESDIS).
- Map: © OpenStreetMap contributors.
- Thresholds: ISPU from PermenLHK P.14/2020 and BMKG rain categories. Details and open questions in `docs/sources.md`.
