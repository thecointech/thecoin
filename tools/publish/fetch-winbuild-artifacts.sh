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

# Validate VERSION against the release-version grammar before constructing
# the remote SSH command, so shell metacharacters cannot reach PowerShell.
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/publish-common.sh"
validate_version "$VERSION" || exit 1

# Open one authenticated connection (prompts for the password once) and reuse
# it for every ssh/scp call below, so the rest of the script runs unattended.
CTRL_DIR=$(mktemp -d)
CTRL_SOCK="$CTRL_DIR/sock"

# Shared SSH options for connection resiliency.
COMMON_SSH_OPTS=(-o ConnectTimeout=30 -o ServerAliveInterval=30 -o ServerAliveCountMax=3)

TMP_ZIP=""
STAGING_DIR=""

cleanup() {
  # Best-effort removal of the local staging area.
  if [[ -n "${STAGING_DIR:-}" ]]; then
    rm -rf "$STAGING_DIR" >/dev/null 2>&1 || true
  fi

  # Best-effort removal of any local temp zip.
  if [[ -n "${TMP_ZIP:-}" ]]; then
    rm -f "$TMP_ZIP" >/dev/null 2>&1 || true
  fi

  # Best-effort removal of remote staging files, but only if the control
  # master is still active so we don't re-prompt for a password.
  if command ssh -S "$CTRL_SOCK" -O check "$VM_USER@$VM_HOST" >/dev/null 2>&1; then
    command ssh -S "$CTRL_SOCK" "${COMMON_SSH_OPTS[@]}" "$VM_USER@$VM_HOST" \
      "powershell -NoProfile -Command \"Remove-Item -Force -Path $REMOTE_ZIP,$REMOTE_PS1 -ErrorAction SilentlyContinue\"" \
      >/dev/null 2>&1 || true
    command ssh -S "$CTRL_SOCK" -O exit "$VM_USER@$VM_HOST" >/dev/null 2>&1 || true
  fi

  rm -rf "$CTRL_DIR" >/dev/null 2>&1 || true
}
trap cleanup EXIT

ssh -MNf -S "$CTRL_SOCK" "${COMMON_SSH_OPTS[@]}" "$VM_USER@$VM_HOST"
ssh() { command ssh -S "$CTRL_SOCK" "${COMMON_SSH_OPTS[@]}" "$@"; }
scp() { command scp -o ControlPath="$CTRL_SOCK" "${COMMON_SSH_OPTS[@]}" "$@"; }

echo "Staging + zipping artifacts matching *$VERSION* (and RELEASES) under out/ on the VM..."
scp "$LOCAL_PS1" "$VM_USER@$VM_HOST:$REMOTE_PS1"
timeout 600 ssh "$VM_USER@$VM_HOST" "powershell -NoProfile -File $REMOTE_PS1 -Version $VERSION -OutRoot $VM_REPO/apps/harvester/out -ZipPath $REMOTE_ZIP"

echo "Pulling zip back to a staging area..."
mkdir -p "$(dirname "$DEST_ROOT")"
STAGING_DIR=$(mktemp -d "$DEST_ROOT.staging.XXXXXX")
TMP_ZIP="$STAGING_DIR/artifacts.zip"
scp "$VM_USER@$VM_HOST:$REMOTE_ZIP" "$TMP_ZIP"
unzip -o -q "$TMP_ZIP" -d "$STAGING_DIR"

# Only replace DEST_ROOT after both download and extraction succeed.
echo "Promoting staging area to $DEST_ROOT..."
rm -rf "$DEST_ROOT"
mv "$STAGING_DIR" "$DEST_ROOT"
STAGING_DIR=""
TMP_ZIP=""

echo "Done. Artifacts (still grouped by out/<config>/... structure):"
find "$DEST_ROOT" -type f
