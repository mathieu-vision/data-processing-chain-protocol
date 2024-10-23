#!/bin/bash
TYPE=""
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --type) TYPE="$2"; shift ;;
    esac
    shift
done
function cleanup {
  echo "Stopping all pnpm processes..."
  kill $(jobs -p)
}
trap cleanup SIGINT
if [[ -n "$TYPE" ]]; then
  pnpm dev --type "$TYPE" --port 8887 --connector_uid "connector-initiator" &
  pnpm dev --type "$TYPE" --port 8888 --connector_uid "remote-connector1" &
  pnpm dev --type "$TYPE" --port 8889 --connector_uid "remote-connector2" &
  pnpm dev --type "$TYPE" --port 8890 --connector_uid "remote-connector3" &
else
  pnpm dev --port 8887 --connector_uid "connector-initiator" &
  pnpm dev --port 8888 --connector_uid "remote-connector1" &
  pnpm dev --port 8889 --connector_uid "remote-connector2" &
  pnpm dev --port 8890 --connector_uid "remote-connector3" &
fi
wait