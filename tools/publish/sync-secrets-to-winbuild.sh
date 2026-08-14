#!/usr/bin/env bash
# Copies the local $THECOIN_SECRETS directory to the harvester-winbuild VM,
# and points the VM's own %THECOIN_SECRETS% at the copy.
# This is a one-shot copy (not a live share) - rerun after updating secrets locally.
set -euo pipefail

VM_HOST="192.168.122.50"
VM_USER="build"
VM_PATH="C:/thecoin-env/secrets"

SRC="${THECOIN_SECRETS:?THECOIN_SECRETS is not set on this host}"
if [[ ! -d "$SRC" ]]; then
  echo "THECOIN_SECRETS ($SRC) is not a directory" >&2
  exit 1
fi

echo "Syncing $SRC -> $VM_USER@$VM_HOST:$VM_PATH"

# (Re)create the target directory on the VM, so old/stale files don't linger
ssh "$VM_USER@$VM_HOST" "powershell -NoProfile -Command \"Remove-Item -Recurse -Force $VM_PATH -ErrorAction SilentlyContinue; New-Item -ItemType Directory -Force -Path $VM_PATH | Out-Null\""

# Copy every file/subdir individually (including dotfiles like .env) so we
# don't depend on scp's directory-nesting semantics.
shopt -s dotglob nullglob
scp -r "$SRC"/* "$VM_USER@$VM_HOST:$VM_PATH/"
shopt -u dotglob nullglob

# Point the VM's own THECOIN_SECRETS at the copied location (persists for
# *future* sessions only - setx doesn't affect already-open shells).
WIN_PATH=${VM_PATH//\//\\}
ssh "$VM_USER@$VM_HOST" "setx THECOIN_SECRETS \"$WIN_PATH\""

echo "Done. VM's THECOIN_SECRETS is now $WIN_PATH (new shells/sessions only)."
