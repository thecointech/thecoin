#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Parse arguments
TARGET_VERSION=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --help|-h)
      echo "Usage: release.sh status [VERSION]"
      echo ""
      echo "Shows the current state of a release."
      echo "If no version is given, shows all active releases."
      exit 0
      ;;
    *)
      if [[ "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        TARGET_VERSION="$1"
      elif [[ "$1" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        TARGET_VERSION=$(strip_v "$1")
      else
        echo -e "${RED}❌ Unknown option: $1${NC}"
        exit 1
      fi
      shift
      ;;
  esac
done

echo -e "${BLUE}📋 Release Status${NC}"
echo ""

fetch_origin

show_version_status() {
  local base state test_tag beta_tag stable
  base="$1"
  state=$(release_state "$base")
  test_tag=$(latest_test_tag "$base")
  beta_tag=$(latest_beta_tag "$base")
  stable=$(stable_tag "$base")

  local state_icon
  case "$state" in
    test)   state_icon="🧪" ;;
    beta)   state_icon="🔶" ;;
    stable) state_icon="✅" ;;
    *)      state_icon="❓" ;;
  esac

  echo -e "${GREEN}$state_icon v$base${NC} — $state"

  if [ -n "$test_tag" ]; then
    local test_commit test_date
    test_commit=$(git rev-list -n 1 "$test_tag" 2>/dev/null)
    test_date=$(git log -1 --format='%ci' "$test_tag" 2>/dev/null | cut -d' ' -f1)
    echo -e "   ${BLUE}test:${NC}   $test_tag  ($test_date, ${test_commit:0:8})"
  fi

  if [ -n "$beta_tag" ]; then
    local beta_commit beta_date
    beta_commit=$(git rev-list -n 1 "$beta_tag" 2>/dev/null)
    beta_date=$(git log -1 --format='%ci' "$beta_tag" 2>/dev/null | cut -d' ' -f1)
    echo -e "   ${BLUE}beta:${NC}   $beta_tag  ($beta_date, ${beta_commit:0:8})"
  fi

  if [ -n "$stable" ]; then
    local stable_commit stable_date
    stable_commit=$(git rev-list -n 1 "$stable" 2>/dev/null)
    stable_date=$(git log -1 --format='%ci' "$stable" 2>/dev/null | cut -d' ' -f1)
    echo -e "   ${BLUE}stable:${NC} $stable  ($stable_date, ${stable_commit:0:8})"
  fi

  # Show next action
  case "$state" in
    test)
      echo -e "   ${YELLOW}→ Next: ./tools/release.sh promote $base${NC}"
      ;;
    beta)
      echo -e "   ${YELLOW}→ Next: ./tools/release.sh promote $base${NC}"
      ;;
    stable)
      echo -e "   ${YELLOW}→ Merge release branch back to main${NC}"
      ;;
  esac
  echo ""
}

if [ -n "$TARGET_VERSION" ]; then
  STATE=$(release_state "$TARGET_VERSION")
  if [ "$STATE" = "none" ]; then
    echo -e "${RED}❌ No release tags found for v$TARGET_VERSION${NC}"
    exit 1
  fi
  show_version_status "$TARGET_VERSION"
else
  # Collect all unique base versions from release tags
  ALL_VERSIONS=$(git tag -l 'v*.*.*-test.*' 'v*.*.*-beta.*' 'v*.*.*' \
    | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+' \
    | sed 's/^v//' | sed 's/-\(test\|beta\)\..*//' \
    | sort -V -u)

  if [ -z "$ALL_VERSIONS" ]; then
    echo -e "${YELLOW}No release tags found${NC}"
    echo -e "${YELLOW}Create a release with: ./tools/release.sh create${NC}"
    exit 0
  fi

  # Show only active releases (not yet stable, or recently stable)
  FOUND=false
  for ver in $ALL_VERSIONS; do
    state=$(release_state "$ver")
    if [ "$state" != "stable" ]; then
      show_version_status "$ver"
      FOUND=true
    fi
  done

  if [ "$FOUND" = false ]; then
    echo -e "${GREEN}✅ All releases are at stable — nothing in progress${NC}"
    echo ""
    # Show the latest stable release
    LATEST_STABLE=$(git tag -l 'v*.*.*' --sort=-v:refname | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | head -1)
    if [ -n "$LATEST_STABLE" ]; then
      echo -e "${BLUE}Latest stable:${NC} $LATEST_STABLE"
    fi
  fi
fi
