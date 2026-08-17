#!/usr/bin/env bash
# Copies the local $THECOIN_SECRETS directory to the harvester-winbuild VM,
# and points the VM's own %THECOIN_SECRETS% at the copy.
# This is a one-shot copy (not a live share) - rerun after updating secrets locally.
set -euo pipefail

VM_HOST="192.168.122.50"
VM_USER="build"
VM_PATH="C:/thecoin-env/secrets"
STAGING_PATH="$VM_PATH.staging"

SRC="${THECOIN_SECRETS:?THECOIN_SECRETS is not set on this host}"
if [[ ! -d "$SRC" ]]; then
  echo "THECOIN_SECRETS ($SRC) is not a directory" >&2
  exit 1
fi

echo "Syncing $SRC -> $VM_USER@$VM_HOST:$STAGING_PATH (staging)..."

# Create a fresh staging directory, leaving the existing VM_PATH untouched.
ssh "$VM_USER@$VM_HOST" "powershell -NoProfile -Command \"\$staging='$STAGING_PATH'; if (Test-Path \$staging) { Remove-Item -Recurse -Force \$staging }; New-Item -ItemType Directory -Force -Path \$staging | Out-Null\""

# Copy every file/subdir individually (including dotfiles like .env) so we
# don't depend on scp's directory-nesting semantics.
shopt -s dotglob nullglob
scp -r "$SRC"/* "$VM_USER@$VM_HOST:$STAGING_PATH/"
shopt -u dotglob nullglob

echo "Promoting staged secrets to $VM_PATH..."

# Validate the staged copy and replace VM_PATH with the staging directory.
# Any failure here aborts the script so stale or partial secrets are not left
# in place.
ssh "$VM_USER@$VM_HOST" "powershell -NoProfile -Command \"\$staging='$STAGING_PATH'; if (-not (Test-Path \$staging)) { throw \\\"Staging directory \$staging is missing after copy\\\" }; if (Test-Path '$VM_PATH') { Remove-Item -Recurse -Force '$VM_PATH' }; Move-Item \$staging '$VM_PATH'\""

# Point the VM's own THECOIN_SECRETS at the copied location (persists for
# *future* sessions only - setx doesn't affect already-open shells).
WIN_PATH=${VM_PATH//\//\\}
ssh "$VM_USER@$VM_HOST" "setx THECOIN_SECRETS \"$WIN_PATH\""

echo "Done. VM's THECOIN_SECRETS is now $WIN_PATH (new shells/sessions only)."
