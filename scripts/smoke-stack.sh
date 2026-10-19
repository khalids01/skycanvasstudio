#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
smoke_directory="$(mktemp -d)"
export API_ENV_FILE="$smoke_directory/api.env"
export IMAGE_TAG=check
export DATABASE_URL=postgresql://smoke:smoke-test-only@postgres:5432/skycanvas_smoke
export VITE_SERVER_URL=https://api.example.test
project="scs-smoke-$$"
compose=(docker compose --project-name "$project" -f docker-compose.production.yml -f docker-compose.smoke.yml)
cleanup() {
  status=$?
  if [[ "$status" -ne 0 ]]; then "${compose[@]}" logs --no-color; fi
  "${compose[@]}" down --volumes --remove-orphans >/dev/null
  rm -rf "$smoke_directory"
  exit "$status"
}
trap cleanup EXIT
cat > "$API_ENV_FILE" <<'ENV'
DATABASE_URL=postgresql://smoke:smoke-test-only@postgres:5432/skycanvas_smoke
REDIS_URL=redis://redis:6379
REDIS_KEY_PREFIX=scs-smoke:
BETTER_AUTH_SECRET=smoke-test-only-secret-at-least-32-characters
BETTER_AUTH_URL=https://api.example.test
CORS_ORIGIN=https://studio.example.test
GITHUB_CLIENT_ID=smoke-not-real
GITHUB_CLIENT_SECRET=smoke-not-real
GOOGLE_CLIENT_ID=smoke-not-real
GOOGLE_CLIENT_SECRET=smoke-not-real
DISCORD_CLIENT_ID=smoke-not-real
DISCORD_CLIENT_SECRET=smoke-not-real
AUTH_SESSION_COOKIE_NAME=skycanvasstudio.session_token
ENABLE_POLAR=false
OWNER_SETUP_CHECK=false
ENV
"${compose[@]}" up --detach --wait --wait-timeout 120
migration_id="$("${compose[@]}" ps --all --quiet migrate)"
[[ "$(docker inspect --format '{{.State.Status}}:{{.State.ExitCode}}' "$migration_id")" == exited:0 ]]
[[ "$(docker inspect --format '{{.HostConfig.RestartPolicy.Name}}' "$migration_id")" == no ]]
# A second run must find no pending migrations and succeed without resetting data.
"${compose[@]}" run --rm --no-deps migrate
api_port="$("${compose[@]}" port api 3000 | cut -d: -f2)"
web_port="$("${compose[@]}" port web 3001 | cut -d: -f2)"
curl --fail --silent --show-error "http://127.0.0.1:$api_port/health/ready" >/dev/null
session="$(curl --fail --silent --show-error "http://127.0.0.1:$api_port/session/context")"
printf '%s' "$session" | python3 -c 'import json,sys; assert json.load(sys.stdin)["user"] is None'
for route in / /products/disk-vacuum /products/job-agent; do
  html="$(curl --fail --silent --show-error "http://127.0.0.1:$web_port$route")"
  [[ "$html" == *'SkyCanvas Studio'* ]]
done
html="$(curl --fail --silent --show-error "http://127.0.0.1:$web_port/")"
asset="$(printf '%s' "$html" | python3 -c 'import re,sys; print(re.search(r"/assets/[^\"\s]+\.css", sys.stdin.read()).group(0))')"
curl --fail --silent --show-error "http://127.0.0.1:$web_port$asset" >/dev/null
curl --fail --silent --show-error "http://127.0.0.1:$web_port/favicon.svg" >/dev/null
[[ "$(curl --silent --output /dev/null --write-out '%{http_code}' "http://127.0.0.1:$web_port/products/missing")" == 404 ]]
# A failed migration must prevent either app from starting.
echo "Checking expected failure: a failed migration must block web/API startup."
"${compose[@]}" stop web api
"${compose[@]}" rm --force migrate
cat > "$smoke_directory/fail.yml" <<'YAML'
services:
  migrate:
    command: ["bun", "-e", "process.exit(17)"]
YAML
if "${compose[@]}" -f "$smoke_directory/fail.yml" up --detach web api; then
  echo 'Expected the failed migration to block application startup' >&2
  exit 1
fi
for service in web api; do
  id="$("${compose[@]}" ps --all --quiet "$service")"
  [[ "$(docker inspect --format '{{.State.Running}}' "$id")" == false ]]
done
echo 'Full stack passed: fresh/repeat migrations, migrator exit, failure gating, API readiness/sessions, web pages/assets, and 404s.'
