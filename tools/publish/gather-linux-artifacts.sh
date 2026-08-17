#!/usr/bin/env bash
# Gathers electron-forge's locally-built Linux artifacts into
# ~/thecoin-env/artifacts/linux/<channel>/. Unlike fetch-winbuild-artifacts.sh
# there's no VM to pull from - Linux builds happen right here - so this is
# just a filtered copy of out/<channel>/make/** matching <version>.
#
# Usage: gather-linux-artifacts.sh <version>
#   e.g. gather-linux-artifacts.sh 0.6.6
set -euo pipefail

OUT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../apps/harvester/out" && pwd)"
DEST_ROOT="$HOME/thecoin-env/artifacts/linux"

VERSION="${1:?Usage: gather-linux-artifacts.sh <version> (e.g. 0.6.6)}"

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/publish-common.sh"
validate_version "$VERSION" || exit 1

# development/devlive builds are never uploaded/distributed - skip them.
EXCLUDED_CHANNELS=(development devlive)

echo "Gathering artifacts matching *$VERSION* under $OUT_ROOT/*/make..."
rm -rf "$DEST_ROOT"
mkdir -p "$DEST_ROOT"

FOUND=0
for channel_dir in "$OUT_ROOT"/*/; do
  channel="$(basename "$channel_dir")"
  make_dir="$channel_dir/make"
  [[ -d "$make_dir" ]] || continue
  if [[ " ${EXCLUDED_CHANNELS[*]} " == *" $channel "* ]]; then
    continue
  fi

  mapfile -d '' files < <(find "$make_dir" -type f -name "*$VERSION*" -print0)
  [[ ${#files[@]} -eq 0 ]] && continue

  mkdir -p "$DEST_ROOT/$channel"
  cp "${files[@]}" "$DEST_ROOT/$channel/"
  FOUND=1
done

if [[ "$FOUND" -eq 0 ]]; then
  echo "No files matching *$VERSION* found under $OUT_ROOT/*/make" >&2
  exit 1
fi

echo "Done. Artifacts:"
find "$DEST_ROOT" -type f
