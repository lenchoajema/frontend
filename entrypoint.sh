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

# If a server file exists in known locations, run it directly so the container stays healthy
# Try to locate a server.js and ensure dependencies exist before starting it.
SERVER_CANDIDATES="/app/server.js /app/frontend/server.js /app/backend/server.js"
for p in $SERVER_CANDIDATES; do
  if [ -f "$p" ]; then
    srv_dir=$(dirname "$p")
    # Check for node_modules in candidate dir or common locations
    if [ -d "$srv_dir/node_modules" ] || [ -d "/app/node_modules" ] || [ -d "/app/backend/node_modules" ]; then
      echo "Starting $p (chdir $srv_dir)"
      cd "$srv_dir" || true
      exec node "$(basename "$p")"
    else
      echo "Found $p but missing node_modules; skipping start to avoid crash. Keeping container alive."
      exec tail -f /dev/null
    fi
  fi
done

# If no backend server found, keep container alive so entrypoint rotation has run and backups can be inspected
echo "No backend server found in expected locations; keeping container alive."
exec tail -f /dev/null
