#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/release"

usage() {
  echo "Usage: release.sh <command> [options]"
  echo ""
  echo "Commands:"
  echo "  create    Create a new release branch"
  echo "  promote   Promote a release to the next stage (test → beta → prod)"
  echo "  status    Show current release status"
  echo ""
  echo "Run 'release.sh <command> --help' for command-specific options."
}

if [ $# -eq 0 ]; then
  usage
  exit 1
fi

COMMAND="$1"
shift

case "$COMMAND" in
  create)
    exec bash "$SCRIPT_DIR/create.sh" "$@"
    ;;
  promote)
    exec bash "$SCRIPT_DIR/promote.sh" "$@"
    ;;
  status)
    exec bash "$SCRIPT_DIR/status.sh" "$@"
    ;;
  --help|-h)
    usage
    exit 0
    ;;
  *)
    echo "❌ Unknown command: $COMMAND"
    echo ""
    usage
    exit 1
    ;;
esac
