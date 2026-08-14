#!/usr/bin/env bash
# Uploads ~/thecoin-env/artifacts/<platform>/<config-name>/ to GCS, under a
# path structured by channel/platform so it can double as an update feed
# later (Squirrel/Velopack both expect a per-channel/per-OS directory).
#
# The Squirrel installer filename includes the version (e.g.
# "harvester-0.6.6 Setup.exe"), so it also gets republished under a fixed
# name (HarvesterSetup.exe) that's overwritten each upload - GCS has no
# symlinks, so this fixed-name copy is what gives the website a stable
# "download latest" link.
#
# Usage: upload-artifacts-gcs.sh <platform> <config-name> [bucket]
#   e.g. upload-artifacts-gcs.sh win32 prodtest
set -euo pipefail

PLATFORM="${1:?Usage: upload-artifacts-gcs.sh <platform> <config-name> [bucket]}"
CONFIG_NAME="${2:?Usage: upload-artifacts-gcs.sh <platform> <config-name> [bucket]}"
# tccc-releases (project tccc-release) is the existing bucket used for
# ad-hoc distribution. It has no sub-folder structure today; we lay
# harvester's artifacts out under harvester/<channel>/<platform>/ within it.
BUCKET="${3:-${THECOIN_ARTIFACTS_BUCKET:-tccc-releases}}"

SRC="$HOME/thecoin-env/artifacts/$PLATFORM/$CONFIG_NAME"
DEST="gs://$BUCKET/harvester/$CONFIG_NAME/$PLATFORM"

if [[ ! -d "$SRC" ]]; then
  echo "No artifacts at $SRC - run fetch-winbuild-artifacts.sh first" >&2
  exit 1
fi

echo "Uploading $SRC -> $DEST"
gsutil -m rsync -r -d "$SRC" "$DEST"

INSTALLER=$(find "$SRC" -maxdepth 1 -iname '*Setup.exe' -print -quit)
if [[ -n "$INSTALLER" ]]; then
  # prod needs no differentiator - it's the one channel users expect to find
  # under the plain "HarvesterSetup.exe" name.
  CHANNEL_SUFFIX=""
  [[ "$CONFIG_NAME" != "prod" ]] && CHANNEL_SUFFIX="${CONFIG_NAME^}"
  STABLE_NAME="Harvester${CHANNEL_SUFFIX}Setup.exe"
  echo "Publishing stable download link -> $DEST/$STABLE_NAME"
  gsutil cp "$INSTALLER" "$DEST/$STABLE_NAME"
fi

echo "Done. Bucket contents:"
gsutil ls -r "$DEST"
