#!/bin/sh
set -eu

# Prisma migrate deploy must use a direct Postgres session (not Neon pooler).
# Pooler URLs cannot reliably take pg_advisory_lock → P1002 after 10s.

migrate_url="${DIRECT_DATABASE_URL:-${MIGRATE_DATABASE_URL:-}}"

if [ -z "$migrate_url" ] && [ -n "${DATABASE_URL:-}" ]; then
  migrate_url="$DATABASE_URL"
  case "$migrate_url" in
    *-pooler.*)
      migrate_url=$(printf '%s' "$migrate_url" | sed 's/-pooler//')
      echo "fly-release-migrate: using direct Neon host (stripped -pooler from DATABASE_URL)"
      ;;
  esac
fi

if [ -z "$migrate_url" ]; then
  echo "fly-release-migrate: DATABASE_URL (or DIRECT_DATABASE_URL) is not set" >&2
  exit 1
fi

export DATABASE_URL="$migrate_url"
export PRISMA_MIGRATE_ADVISORY_LOCK_TIMEOUT="${PRISMA_MIGRATE_ADVISORY_LOCK_TIMEOUT:-120000}"

exec ./node_modules/.bin/prisma migrate deploy