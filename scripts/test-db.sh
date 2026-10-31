#!/bin/sh
set -e
cd "$(dirname "$0")/.."
set -a; . ./.env.local; set +a
PATH="$(brew --prefix libpq 2>/dev/null)/bin:$PATH"
if [ -n "$SUPABASE_DB_URL" ]; then psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls.sql; else tail -n +2 supabase/tests/rls.sql > /tmp/awasin-rls.sql && npx supabase db query --linked -f /tmp/awasin-rls.sql < /dev/null | grep -q "rls ok" && echo "rls ok"; fi
