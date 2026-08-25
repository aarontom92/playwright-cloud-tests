#!/usr/bin/env bash
set -u

REPO_DIR="${REPO_DIR:-/opt/playwright-cloud-tests}"
LOG_DIR="${LOG_DIR:-/var/log/padel-booker}"
mkdir -p "$LOG_DIR"

STAMP="$(date +%Y%m%d-%H%M%S)"
RUN_LOG="$LOG_DIR/run-$STAMP.log"

cd "$REPO_DIR" || exit 2

echo "[$(date --iso-8601=seconds)] Starting padel availability check" | tee -a "$RUN_LOG"

set +e
npx playwright test tests/example.spec.js --project=chromium 2>&1 | tee -a "$RUN_LOG"
STATUS=${PIPESTATUS[0]}
set -e

if [ "$STATUS" -eq 0 ]; then
  echo "[$(date --iso-8601=seconds)] Run completed successfully" | tee -a "$RUN_LOG"
  exit 0
fi

# No availability is the normal outcome for a polling run, not an infrastructure failure.
if grep -q "Geen beschikbare baan gevonden" "$RUN_LOG"; then
  echo "[$(date --iso-8601=seconds)] No matching court available" | tee -a "$RUN_LOG"
  exit 0
fi

echo "[$(date --iso-8601=seconds)] Playwright failed with exit code $STATUS" | tee -a "$RUN_LOG"
exit "$STATUS"
