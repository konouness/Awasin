#!/bin/sh
set -e
cd "$(dirname "$0")/.."
set -a; . ./.env.local; set +a
PATH="$(brew --prefix libpq 2>/dev/null)/bin:$PATH"
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls.sql
