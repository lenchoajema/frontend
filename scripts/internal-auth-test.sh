#!/bin/sh
set -eu

API_BASE="http://127.0.0.1:5000/api/auth"
EMAIL="internal_diag_$(date +%s)@test.com"
PASS="pass123"
NAME="InternalDiag"

echo "[internal-auth-test] Using email: $EMAIL"

json_escape() { printf '%s' "$1" | sed 's/"/\\"/g'; }

REGISTER_PAYLOAD='{"name":"'"$(json_escape "$NAME")"'","email":"'"$(json_escape "$EMAIL")"'","password":"'"$(json_escape "$PASS")"'"}'
LOGIN_PAYLOAD='{"email":"'"$(json_escape "$EMAIL")"'","password":"'"$(json_escape "$PASS")"'"}'

echo "--- REGISTER Request Body ---"
echo "$REGISTER_PAYLOAD"

REG_RESP=$(curl -s -D /tmp/reg_headers -o /tmp/reg_body -w '%{http_code}' -H 'Content-Type: application/json' -X POST "$API_BASE/register" --data "$REGISTER_PAYLOAD" || true)

echo "REGISTER HTTP Code: $REG_RESP"
head -n 20 /tmp/reg_headers | sed 's/^/H: /'
echo "--- REGISTER Body ---"
cat /tmp/reg_body | sed 's/^/B: /'

echo "--- LOGIN Request Body ---"
echo "$LOGIN_PAYLOAD"
LOG_RESP=$(curl -s -D /tmp/log_headers -o /tmp/log_body -w '%{http_code}' -H 'Content-Type: application/json' -X POST "$API_BASE/login" --data "$LOGIN_PAYLOAD" || true)

echo "LOGIN HTTP Code: $LOG_RESP"
head -n 20 /tmp/log_headers | sed 's/^/H: /'
echo "--- LOGIN Body ---"
cat /tmp/log_body | sed 's/^/B: /'

# Simple success heuristic
if [ "$REG_RESP" = "201" ] && [ "$LOG_RESP" = "200" ]; then
  echo "RESULT: SUCCESS (register + login)"
  exit 0
else
  echo "RESULT: FAILURE (see output above)"
  exit 1
fi
