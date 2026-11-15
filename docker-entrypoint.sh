#!/bin/sh
set -eu
if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set" >&2
  exit 1
fi
echo "Running prisma migrate deploy..."
bunx prisma migrate deploy
echo "Starting Next.js on 0.0.0.0:${PORT:-3000}"
exec bun run start -- -H 0.0.0.0 -p "${PORT:-3000}"
