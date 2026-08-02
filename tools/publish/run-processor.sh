printf 'Starting tx-processor at %s\n' "$(/bin/date)"
CURRENT_DIR="$(dirname "$0")"
export CONFIG_NAME=prodtest
export THECOIN_SECRETS=${CURRENT_DIR}/env

if docker compose --ansi never -f ${CURRENT_DIR}/docker-compose.yaml up; then
  printf 'Docker app ran at %s\n' "$(/bin/date)"
else
  printf 'Docker app failed to start at %s\n' "$(/bin/date)"
  exit 1
fi