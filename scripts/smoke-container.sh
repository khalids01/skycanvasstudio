#!/usr/bin/env bash
set -euo pipefail
image="${1:?Pass the image tag to test}"
container="$(docker run --detach --publish 127.0.0.1::3000 "$image")"
cleanup() {
  status=$?
  if [[ "$status" -ne 0 ]]; then docker logs "$container"; fi
  docker rm --force "$container" >/dev/null
  exit "$status"
}
trap cleanup EXIT
port="$(docker port "$container" 3000/tcp | cut -d: -f2)"
base_url="http://127.0.0.1:$port"
ready=false
for attempt in {1..30}; do
  if curl --fail --silent "$base_url/healthz" >/dev/null; then ready=true; break; fi
  sleep 1
done
if [[ "$ready" != true ]]; then
  docker logs "$container"
  echo 'Container failed to become ready' >&2
  exit 1
fi
for route in / /products/disk-vacuum /products/job-agent; do
  html="$(curl --fail --silent --show-error "$base_url$route")"
  [[ "$html" == *'SkyCanvas Studio'* ]] || { echo "Missing page content: $route" >&2; exit 1; }
done
html="$(curl --fail --silent --show-error "$base_url/")"
asset="$(printf '%s' "$html" | python3 -c 'import re,sys; print(re.search(r"/assets/[^\"\s]+\.css", sys.stdin.read()).group(0))')"
curl --fail --silent --show-error "$base_url$asset" >/dev/null
curl --fail --silent --show-error "$base_url/favicon.svg" >/dev/null
[[ "$(curl --silent --output /dev/null --write-out '%{http_code}' "$base_url/assets/missing.js")" == 404 ]]
[[ "$(curl --silent --output /dev/null --write-out '%{http_code}' "$base_url/products/missing")" == 404 ]]
echo 'Container smoke checks passed: health, homepage, product pages, static assets, and 404s.'
