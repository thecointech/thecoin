#!/bin/bash

# Shared helpers for release scripts

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Ensure we're at the repo root
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || {
  echo -e "${RED}❌ Error: Not inside a git repository${NC}"
  exit 1
}
if [ ! -d "$REPO_ROOT" ]; then
  echo -e "${RED}❌ Error: Repository root not found: $REPO_ROOT${NC}"
  exit 1
fi
cd "$REPO_ROOT"

# Ensure working tree is clean
ensure_clean_tree() {
  if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}❌ Error: Working tree has uncommitted or untracked changes${NC}"
    git status --short
    exit 1
  fi
}

# Fetch tags and branches from origin
fetch_origin() {
  echo -e "${YELLOW}📡 Fetching latest from origin...${NC}"
  git fetch origin --tags --quiet
}

# Strip 'v' prefix from a version string
strip_v() {
  echo "$1" | sed 's/^v//'
}

# Extract base version (strip -test.N or -beta.N suffix)
base_version() {
  echo "$1" | sed 's/^v//' | sed 's/-\(test\|beta\)\..*//'
}

# Find the latest test tag for a given base version, or across all versions
# Usage: latest_test_tag [base_version]
latest_test_tag() {
  local pattern
  if [ -n "$1" ]; then
    pattern="v$1-test.*"
  else
    pattern="v*.*.*-test.*"
  fi
  git tag -l "$pattern" --sort=-v:refname | head -1
}

# Find the latest beta tag for a given base version, or across all versions
# Usage: latest_beta_tag [base_version]
latest_beta_tag() {
  local pattern
  if [ -n "$1" ]; then
    pattern="v$1-beta.*"
  else
    pattern="v*.*.*-beta.*"
  fi
  git tag -l "$pattern" --sort=-v:refname | head -1
}

# Find the stable tag for a given base version
# Usage: stable_tag <base_version>
stable_tag() {
  git tag -l "v$1" | head -1
}

# Determine the release state for a given base version
# Returns: "none", "test", "beta", "stable"
# Usage: release_state <base_version>
release_state() {
  local base="$1"
  if [ -n "$(stable_tag "$base")" ]; then
    echo "stable"
  elif [ -n "$(latest_beta_tag "$base")" ]; then
    echo "beta"
  elif [ -n "$(latest_test_tag "$base")" ]; then
    echo "test"
  else
    echo "none"
  fi
}

# Prompt for confirmation (unless --yes was passed)
# Usage: confirm "message" $SKIP_CONFIRM
confirm() {
  local message="$1"
  local skip="$2"
  if [ "$skip" = true ]; then
    return 0
  fi
  read -p "$(echo -e "${YELLOW}${message} [y/N]:${NC} ")" -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Cancelled${NC}"
    exit 1
  fi
}
