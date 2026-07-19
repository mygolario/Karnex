#!/usr/bin/env bash
# Push FIXIE_URL from local .env to Vercel Production + Preview.
# Usage:
#   1. Put FIXIE_URL in .env (gitignored)
#   2. vercel login && vercel link  (project: karnex)
#   3. ./scripts/setup-fixie-vercel-env.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Missing .env — add FIXIE_URL first (see .env.example)." >&2
  exit 1
fi

# shellcheck disable=SC1091
set -a
# Only load FIXIE_URL from .env (avoid sourcing unrelated values with spaces)
FIXIE_URL="$(grep -E '^FIXIE_URL=' .env | head -1 | cut -d= -f2-)"
set +a

if [[ -z "${FIXIE_URL:-}" ]]; then
  echo "FIXIE_URL is empty in .env" >&2
  exit 1
fi

if ! command -v vercel >/dev/null 2>&1 && ! command -v npx >/dev/null 2>&1; then
  echo "Need vercel CLI or npx." >&2
  exit 1
fi

VC=(vercel)
if ! command -v vercel >/dev/null 2>&1; then
  VC=(npx --yes vercel)
fi

echo "Setting FIXIE_URL on Production and Preview (value not printed)..."

# Remove existing so re-runs are idempotent (ignore failures if unset)
"${VC[@]}" env rm FIXIE_URL production -y >/dev/null 2>&1 || true
"${VC[@]}" env rm FIXIE_URL preview -y >/dev/null 2>&1 || true

printf '%s' "$FIXIE_URL" | "${VC[@]}" env add FIXIE_URL production
printf '%s' "$FIXIE_URL" | "${VC[@]}" env add FIXIE_URL preview

echo "Done. Redeploy Production/Preview so the new env is picked up."
echo "Zibal whitelist (Fixie EU West outbound): 54.195.3.54  54.217.142.99"
