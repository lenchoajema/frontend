#!/bin/sh
# Simple rotation script for request trace logs.
# - Copies current TRACE_FILE to BACKUP_DIR with timestamp and gzips it
# - Removes backups older than RETAIN_DAYS or keeps only RETAIN_COUNT latest

set -eu

TRACE_FILE="${TRACE_FILE:-/tmp/request-trace.log}"
BACKUP_DIR="${BACKUP_DIR:-/tmp/trace-backups}"
RETAIN_COUNT="${RETAIN_COUNT:-5}"
RETAIN_DAYS="${RETAIN_DAYS:-7}"

mkdir -p "$BACKUP_DIR"

timestamp() {
  date -u +%Y%m%dT%H%M%SZ
}

if [ -f "$TRACE_FILE" ]; then
  TS=$(timestamp)
  BASENAME="$(basename "$TRACE_FILE")"
  BACKUP="$BACKUP_DIR/${BASENAME}.${TS}.bak"
  # Copy with same perms then gzip
  cp -p "$TRACE_FILE" "$BACKUP" && gzip -9 "$BACKUP" || true
  echo "Rotated $TRACE_FILE -> $BACKUP.gz"
else
  echo "No trace file at $TRACE_FILE to rotate"
fi

# cleanup by age
find "$BACKUP_DIR" -type f -name "*.bak.gz" -mtime +"$RETAIN_DAYS" -print -exec rm -f {} \; || true

# cleanup by count: keep RETAIN_COUNT newest
COUNT=$(ls -1t "$BACKUP_DIR"/*.bak.gz 2>/dev/null | wc -l || true)
if [ "$COUNT" -gt "$RETAIN_COUNT" ]; then
  ls -1t "$BACKUP_DIR"/*.bak.gz | tail -n +$((RETAIN_COUNT + 1)) | xargs -r rm -f || true
fi

exit 0
