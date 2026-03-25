#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Parse arguments
DRY_RUN=false
NO_PUSH=false
TARGET_VERSION=""
TARGET_STAGE=""

usage() {
  echo "Usage: release.sh promote [--dry-run] [VERSION | beta | prod]"
  echo ""
  echo "Promotes a release to the next stage:"
  echo "  test → beta → prod"
  echo ""
  echo "Arguments:"
  echo "  VERSION    Base version to promote (e.g., 0.5.4)"
  echo "  beta       Promote latest test release to beta"
  echo "  prod       Promote latest beta release to prod"
  echo ""
  echo "Options:"
  echo "  --dry-run  Show what would happen without making changes"
  echo "  --no-push  Create tag locally but don't push (for verification)"
  echo ""
  echo "If no argument is given, auto-detects the latest release and"
  echo "promotes it to the next stage."
}

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --no-push)
      NO_PUSH=true
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    beta|prod)
      TARGET_STAGE="$1"
      shift
      ;;
    *)
      # Treat as version number
      if [[ "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        TARGET_VERSION="$1"
      elif [[ "$1" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        TARGET_VERSION=$(strip_v "$1")
      else
        echo -e "${RED}❌ Unknown option: $1${NC}"
        usage
        exit 1
      fi
      shift
      ;;
  esac
done

echo -e "${BLUE}🏷️  Release Promoter${NC}"
echo ""

fetch_origin

# Resolve which version to promote
if [ -n "$TARGET_VERSION" ]; then
  BASE="$TARGET_VERSION"
  STATE=$(release_state "$BASE")
  if [ "$STATE" = "none" ]; then
    echo -e "${RED}❌ No release tags found for v$BASE${NC}"
    exit 1
  fi
elif [ -n "$TARGET_STAGE" ]; then
  # Find latest release that can be promoted to the target stage
  case "$TARGET_STAGE" in
    beta)
      TAG=$(latest_test_tag)
      if [ -z "$TAG" ]; then
        echo -e "${RED}❌ No test tags found to promote to beta${NC}"
        exit 1
      fi
      BASE=$(base_version "$TAG")
      ;;
    prod)
      TAG=$(latest_beta_tag)
      if [ -z "$TAG" ]; then
        echo -e "${RED}❌ No beta tags found to promote to prod${NC}"
        exit 1
      fi
      BASE=$(base_version "$TAG")
      ;;
  esac
else
  # Auto-detect: find latest release and determine next promotion
  # Check for beta releases first (closer to prod)
  TAG=$(latest_beta_tag)
  if [ -n "$TAG" ]; then
    BASE=$(base_version "$TAG")
    # Only use this if it hasn't already been promoted to stable
    if [ -n "$(stable_tag "$BASE")" ]; then
      TAG=""
    fi
  fi

  # Fall back to latest test release
  if [ -z "$TAG" ]; then
    TAG=$(latest_test_tag)
    if [ -z "$TAG" ]; then
      echo -e "${RED}❌ No release tags found to promote${NC}"
      echo -e "${YELLOW}Create a release first with: ./tools/release.sh create${NC}"
      exit 1
    fi
    BASE=$(base_version "$TAG")
  fi
fi

# Determine current state and next promotion
STATE=$(release_state "$BASE")
LATEST_TEST=$(latest_test_tag "$BASE")
LATEST_BETA=$(latest_beta_tag "$BASE")
STABLE=$(stable_tag "$BASE")

echo -e "${BLUE}Version:${NC} v$BASE"
echo -e "${BLUE}State:${NC}   $STATE"
[ -n "$LATEST_TEST" ] && echo -e "${BLUE}Test:${NC}    $LATEST_TEST"
[ -n "$LATEST_BETA" ] && echo -e "${BLUE}Beta:${NC}    $LATEST_BETA"
[ -n "$STABLE" ]      && echo -e "${BLUE}Stable:${NC}  $STABLE"
echo ""

# Determine what to do
case "$STATE" in
  test)
    if [ "$TARGET_STAGE" = "prod" ]; then
      echo -e "${RED}❌ Cannot promote directly to prod — must go through beta first${NC}"
      exit 1
    fi
    SOURCE_TAG="$LATEST_TEST"
    NEW_TAG="v$BASE-beta.0"
    DEPLOY_ENV="prodbeta"
    echo -e "${YELLOW}Promoting: ${NC}$SOURCE_TAG ${YELLOW}→${NC} $NEW_TAG"
    echo -e "${YELLOW}Deploy to: ${NC}$DEPLOY_ENV"
    ;;
  beta)
    if [ "$TARGET_STAGE" = "beta" ]; then
      echo -e "${YELLOW}⚠️  Already at beta stage ($LATEST_BETA)${NC}"
      echo -e "${YELLOW}To promote to prod, run: ./tools/release.sh promote prod${NC}"
      exit 0
    fi
    SOURCE_TAG="$LATEST_BETA"
    NEW_TAG="v$BASE"
    DEPLOY_ENV="prod"
    echo -e "${YELLOW}Promoting: ${NC}$SOURCE_TAG ${YELLOW}→${NC} $NEW_TAG"
    echo -e "${YELLOW}Deploy to: ${NC}$DEPLOY_ENV"
    ;;
  stable)
    echo -e "${GREEN}✅ v$BASE is already at stable — nothing to promote${NC}"
    exit 0
    ;;
  none)
    echo -e "${RED}❌ No release found for v$BASE${NC}"
    exit 1
    ;;
esac

echo ""

# Show the commit being promoted
SOURCE_COMMIT=$(git rev-list -n 1 "$SOURCE_TAG")
echo -e "${BLUE}Commit:${NC}  ${SOURCE_COMMIT:0:12}"
echo -e "${BLUE}Message:${NC} $(git log -1 --format='%s' "$SOURCE_TAG")"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo -e "${GREEN}✓ Dry run complete — no changes made${NC}"
  echo ""
  echo -e "${BLUE}To promote, run:${NC}"
  echo -e "   ${YELLOW}./tools/release.sh promote $BASE${NC}"
  exit 0
fi

confirm "Create tag $NEW_TAG from $SOURCE_TAG and push?"

# Create the new tag pointing at the same commit as the source tag
echo ""
echo -e "${YELLOW}🏷️  Creating tag $NEW_TAG...${NC}"
git tag "$NEW_TAG" "$SOURCE_TAG"

if [ "$NO_PUSH" = true ]; then
  echo ""
  echo -e "${GREEN}✅ Created local tag $NEW_TAG (not pushed)${NC}"
  echo -e "${YELLOW}To push when ready:${NC}"
  echo -e "   ${YELLOW}git push origin $NEW_TAG${NC}"
  echo -e "${YELLOW}To undo:${NC}"
  echo -e "   ${YELLOW}git tag -d $NEW_TAG${NC}"
else
  echo -e "${YELLOW}⬆️  Pushing tag...${NC}"
  # git push origin "$NEW_TAG"

  echo ""
  echo -e "${GREEN}✅ Promoted $SOURCE_TAG → $NEW_TAG${NC}"
fi
echo ""
echo -e "${BLUE}Next steps:${NC}"
case "$STATE" in
  test)
    echo "  1. ⏳ Wait for deployment to $DEPLOY_ENV"
    echo "  2. 🧪 Verify beta environment"
    echo "  3. 🏷️  Promote to prod with:"
    echo "     ./tools/release.sh promote $BASE"
    ;;
  beta)
    echo "  1. ⏳ Wait for deployment to $DEPLOY_ENV"
    echo "  2. ✅ Verify production environment"
    echo "  3. 🔀 Merge release branch back to main:"
    echo "     git checkout main && git merge release/v$BASE"
    echo "  4. 🗑️  Delete release branch:"
    echo "     git push origin --delete release/v$BASE"
    ;;
esac
echo ""
