#!/usr/bin/env bash
# Uploads ~/thecoin-env/artifacts/<platform>/<config-name>/ to GCS, under a
# path structured by channel/platform so it can double as an update feed
# later (Squirrel/Velopack both expect a per-channel/per-OS directory).
#
# The installer filename includes the version (e.g. "harvester-0.6.6 Setup.exe"
# or "harvester_0.6.6_amd64.deb"), so it also gets republished under a fixed
# name (e.g. HarvesterSetup.exe / Harvester.deb) that's overwritten each
# upload - GCS has no symlinks, so this fixed-name copy is what gives the
# website a stable "download latest" link.
#
# Usage: upload-artifacts-gcs.sh <platform> <config-name> [bucket]
#   e.g. upload-artifacts-gcs.sh win32 prodtest
#   e.g. upload-artifacts-gcs.sh linux prodbeta
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
  echo "No artifacts at $SRC - run fetch-winbuild-artifacts.sh or gather-linux-artifacts.sh first" >&2
  exit 1
fi

echo "Uploading $SRC -> $DEST"
gsutil -m rsync -r -d "$SRC" "$DEST"

# prod needs no differentiator - it's the one channel users expect to find
# under the plain "Harvester..." name.
CHANNEL_SUFFIX=""
[[ "$CONFIG_NAME" != "prod" ]] && CHANNEL_SUFFIX="${CONFIG_NAME^}"

case "$PLATFORM" in
  win32) INSTALLER_GLOB='*Setup.exe'; STABLE_NAME="Harvester${CHANNEL_SUFFIX}Setup.exe" ;;
  linux) INSTALLER_GLOB='*.deb'; STABLE_NAME="Harvester${CHANNEL_SUFFIX}.deb" ;;
  *) INSTALLER_GLOB=""; STABLE_NAME="" ;;
esac

if [[ -n "$INSTALLER_GLOB" ]]; then
  INSTALLER=$(find "$SRC" -maxdepth 1 -iname "$INSTALLER_GLOB" -print -quit)
  if [[ -n "$INSTALLER" ]]; then
    echo "Publishing stable download link -> $DEST/$STABLE_NAME"
    gsutil cp "$INSTALLER" "$DEST/$STABLE_NAME"
  fi
fi

echo "Done. Bucket contents:"
gsutil ls -r "$DEST"
