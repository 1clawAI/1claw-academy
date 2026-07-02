#!/usr/bin/env bash
# Smoke tests for the endpoints used in the 1Claw Academy workshop steps.
#
# Part A (reachability): runs with no credentials. Sends an invalid Bearer to
#   every endpoint and asserts the route exists (any status other than 404).
#   This catches wrong paths, wrong methods, and typos in the lessons.
#
# Part B (authed happy path): runs only if ONECLAW_API_KEY (a 1ck_ key) is set.
#   Exercises the real human flow end to end and cleans up after itself.
#
# Usage:
#   bash scripts/smoke-api.sh                 # Part A only
#   ONECLAW_API_KEY=1ck_... bash scripts/smoke-api.sh   # Part A + Part B

set -uo pipefail
BASE="${ONECLAW_BASE_URL:-https://api.1claw.xyz}"
SHROUD="${ONECLAW_SHROUD_URL:-https://shroud.1claw.xyz}"
MCP="${ONECLAW_MCP_URL:-https://mcp.1claw.xyz}"
pass=0; fail=0

hr() { printf '%s\n' "------------------------------------------------------------"; }

# probe METHOD URL [extra curl args...] -> prints status, asserts != 404
probe() {
  local method="$1" url="$2"; shift 2
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url" \
    -H "Authorization: Bearer invalid-token-for-reachability" \
    -H "Content-Type: application/json" "$@" --max-time 20)
  local label="$method ${url#https://}"
  if [ "$code" = "404" ] || [ "$code" = "000" ]; then
    printf "  \033[31mFAIL\033[0m %-58s %s\n" "$label" "$code"; fail=$((fail+1))
  else
    printf "  \033[32mOK\033[0m   %-58s %s\n" "$label" "$code"; pass=$((pass+1))
  fi
}

echo; hr; echo "PART A: endpoint reachability (no credentials)"; hr
DUM="00000000-0000-0000-0000-000000000000"

echo "[auth]"
probe POST "$BASE/v1/auth/api-key-token"  -d '{"api_key":"1ck_invalid"}'
probe POST "$BASE/v1/auth/agent-token"    -d '{"agent_id":"'$DUM'","api_key":"ocv_invalid"}'
probe POST "$BASE/v1/auth/token"          -d '{"email":"x@y.z","password":"x"}'

echo "[vaults + secrets]"
probe GET  "$BASE/v1/vaults"
probe POST "$BASE/v1/vaults"                                  -d '{"name":"probe"}'
probe PUT  "$BASE/v1/vaults/$DUM/secrets/api-keys/demo"       -d '{"type":"api_key","value":"x"}'
probe GET  "$BASE/v1/vaults/$DUM/secrets/api-keys/demo"
probe POST "$BASE/v1/vaults/$DUM/secret-rotate/api-keys%2Fdemo" -d '{"length":32,"charset":"hex"}'
probe GET  "$BASE/v1/vaults/$DUM/secret-versions/api-keys/demo"

echo "[agents + policies]"
probe POST "$BASE/v1/agents"                    -d '{"name":"probe"}'
probe POST "$BASE/v1/agents/enroll"             -d '{}'  # empty body: reachability only, no enrollment created
probe POST "$BASE/v1/vaults/$DUM/policies"      -d '{"principal_type":"agent","principal_id":"'$DUM'","permissions":["read"],"secret_path_pattern":"*"}'
probe GET  "$BASE/v1/audit/events?limit=1"

echo "[intents + treasury]"
probe POST "$BASE/v1/agents/$DUM/signing-keys"  -d '{"chain":"ethereum"}'
probe POST "$BASE/v1/agents/$DUM/transactions"  -d '{"chain":"sepolia","to":"0x0","value":"0"}'
probe POST "$BASE/v1/treasury/wallets/generate" -d '{"chains":["ethereum"]}'
probe POST "$BASE/v1/treasury"                  -d '{"name":"probe","safe_address":"0x0"}'

echo "[advanced security]"
probe POST "$BASE/v1/vaults/$DUM/cmek"          -d '{"fingerprint":"x"}'
probe POST "$BASE/v1/vaults/$DUM/mpc"           -d '{"custody_mode":"2of2_client_custody"}'
probe POST "$BASE/v1/risk/honeytokens"          -d '{"vault_id":"'$DUM'","secret_path":"x"}'

echo "[platform + billing]"
probe POST "$BASE/v1/platform/apps"             -d '{"name":"probe","slug":"probe"}'
probe PATCH "$BASE/v1/billing/overage-method"   -d '{"overage_method":"x402"}'

echo "[shroud + mcp]"
probe POST "$SHROUD/v1/chat/completions" -H "X-Shroud-Provider: openai" -d '{"model":"gpt-4o-mini","messages":[]}'
probe POST "$MCP/mcp" -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'

echo; echo "Reachability: $pass ok, $fail failed (404/000 = broken path)."

# ---------------------------------------------------------------------------
if [ -z "${ONECLAW_API_KEY:-}" ]; then
  echo; hr
  echo "PART B skipped. Set a fresh 1ck_ key to run the real happy path:"
  echo "  ONECLAW_API_KEY=1ck_... bash scripts/smoke-api.sh"
  hr; exit 0
fi

echo; hr; echo "PART B: authed human happy path"; hr
AUTH=(-H "Authorization: Bearer $ONECLAW_API_KEY")
step() { printf "  %-46s" "$1"; }
ok()   { printf "\033[32mOK\033[0m %s\n" "${1:-}"; pass=$((pass+1)); }
bad()  { printf "\033[31mFAIL\033[0m %s\n" "${1:-}"; fail=$((fail+1)); }

step "list vaults (key works as Bearer)"
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/v1/vaults" "${AUTH[@]}")
[ "$code" = "200" ] && ok "$code" || { bad "$code (key invalid? rotate and retry)"; exit 1; }

step "create test vault"
VID=$(curl -s -X POST "$BASE/v1/vaults" "${AUTH[@]}" -H "Content-Type: application/json" \
  -d '{"name":"academy-smoke","description":"temp, safe to delete"}' | jq -r '.id // .vault.id // empty')
[ -n "$VID" ] && ok "$VID" || { bad "no vault id"; exit 1; }

step "put secret academy/smoke"
curl -s -o /dev/null -X PUT "$BASE/v1/vaults/$VID/secrets/academy/smoke" "${AUTH[@]}" \
  -H "Content-Type: application/json" -d '{"type":"note","value":"hello-1claw"}' && ok || bad

step "get secret and check value"
VAL=$(curl -s "$BASE/v1/vaults/$VID/secrets/academy/smoke" "${AUTH[@]}" | jq -r '.value // .secret.value // empty')
[ "$VAL" = "hello-1claw" ] && ok "value matches" || bad "got '$VAL'"

step "list secrets (metadata only)"
curl -s "$BASE/v1/vaults/$VID/secrets" "${AUTH[@]}" -o /dev/null -w "%{http_code}" | grep -q 200 && ok || bad

step "server-side rotate"
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  "$BASE/v1/vaults/$VID/secret-rotate/academy%2Fsmoke" "${AUTH[@]}" \
  -H "Content-Type: application/json" -d '{"length":24,"charset":"hex"}')
{ [ "$code" = "200" ] || [ "$code" = "201" ]; } && ok "$code" || bad "$code"

step "list versions (expect >= 2)"
N=$(curl -s "$BASE/v1/vaults/$VID/secret-versions/academy/smoke" "${AUTH[@]}" | jq '(.versions // .) | length' 2>/dev/null)
[ "${N:-0}" -ge 2 ] 2>/dev/null && ok "$N versions" || bad "got ${N:-0}"

step "query audit log"
curl -s "$BASE/v1/audit/events?limit=5" "${AUTH[@]}" -o /dev/null -w "%{http_code}" | grep -q 200 && ok || bad

step "cleanup: delete test vault"
code=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/v1/vaults/$VID" "${AUTH[@]}")
{ [ "$code" = "200" ] || [ "$code" = "204" ]; } && ok "$code" || bad "$code (delete vault $VID by hand)"

echo; hr
echo "TOTAL: $pass ok, $fail failed."
[ "$fail" -eq 0 ] && echo "All tested flows passed." || echo "Some flows failed, see above."
