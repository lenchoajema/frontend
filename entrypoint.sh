#!/bin/sh
# Entry point for backend container.
# Runs trace rotation/cleanup then starts the app.
set -eu

# Allow configuring trace paths via env
: "${TRACE_FILE:=/tmp/request-trace.log}"
: "${BACKUP_DIR:=/tmp/trace-backups}"
: "${RETAIN_COUNT:=5}"
: "${RETAIN_DAYS:=7}"

# Make sure rotation script is executable
if [ -x /app/scripts/rotate-traces.sh ]; then
  echo "Running trace rotation"
  /app/scripts/rotate-traces.sh || true
else
  echo "rotate-traces.sh not executable or missing; skipping rotation"
fi

# Ensure backup dir exists
mkdir -p "$BACKUP_DIR"
chown -R node:node "$BACKUP_DIR" || true

# Exec the main process as provided (npm start by default)
exec "$@"
