#!/usr/bin/env bash
# Pulls electron-forge's built artifacts off the harvester-winbuild VM into
# ~/thecoin-env/artifacts/win32/. Matches files by version (searched
# recursively under out/) plus any RELEASES file, and preserves each file's
# path relative to out/ - so out/{config}/harvester-{platform}-{arch}/...
# stays intact and files with the same name from different channels (e.g.
# RELEASES) don't collide.
#
# Usage: fetch-winbuild-artifacts.sh <version>
#   e.g. fetch-winbuild-artifacts.sh 0.6.6
set -euo pipefail

VM_HOST="192.168.122.50"
VM_USER="build"
VM_REPO="C:/src/thecoin"
REMOTE_ZIP="C:/thecoin-env/winbuild-artifacts.zip"
REMOTE_PS1="C:/thecoin-env/fetch-artifacts.ps1"
LOCAL_PS1="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/fetch-artifacts.ps1"

VERSION="${1:?Usage: fetch-winbuild-artifacts.sh <version> (e.g. 0.6.6)}"
DEST_ROOT="$HOME/thecoin-env/artifacts/win32"

# Open one authenticated connection (prompts for the password once) and reuse
# it for every ssh/scp call below, so the rest of the script runs unattended.
CTRL_SOCK=$(mktemp -u)
cleanup() { command ssh -S "$CTRL_SOCK" -O exit "$VM_USER@$VM_HOST" >/dev/null 2>&1 || true; }
trap cleanup EXIT
ssh -MNf -S "$CTRL_SOCK" "$VM_USER@$VM_HOST"
ssh() { command ssh -S "$CTRL_SOCK" "$@"; }
scp() { command scp -o ControlPath="$CTRL_SOCK" "$@"; }

echo "Staging + zipping artifacts matching *$VERSION* (and RELEASES) under out/ on the VM..."
scp "$LOCAL_PS1" "$VM_USER@$VM_HOST:$REMOTE_PS1"
ssh "$VM_USER@$VM_HOST" "powershell -NoProfile -File $REMOTE_PS1 -Version $VERSION -OutRoot $VM_REPO/apps/harvester/out -ZipPath $REMOTE_ZIP"

echo "Pulling zip back to $DEST_ROOT..."
rm -rf "$DEST_ROOT"
mkdir -p "$DEST_ROOT"
TMP_ZIP=$(mktemp --suffix=.zip)
scp "$VM_USER@$VM_HOST:$REMOTE_ZIP" "$TMP_ZIP"
unzip -o -q "$TMP_ZIP" -d "$DEST_ROOT"
rm -f "$TMP_ZIP"

echo "Cleaning up remote files..."
ssh "$VM_USER@$VM_HOST" "powershell -NoProfile -Command \"Remove-Item -Force $REMOTE_ZIP,$REMOTE_PS1\""

echo "Done. Artifacts (still grouped by out/<config>/... structure):"
find "$DEST_ROOT" -type f
