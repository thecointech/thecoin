#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
DRY_RUN=false
if [ "$1" == "--dry-run" ]; then
  DRY_RUN=true
fi

echo -e "${BLUE}🚀 Release Branch Creator${NC}"
echo ""

# Ensure we're on main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo -e "${RED}❌ Error: Must be on main branch (currently on: $CURRENT_BRANCH)${NC}"
  exit 1
fi

# Ensure working tree is clean (including untracked files)
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${RED}❌ Error: Working tree has uncommitted or untracked changes${NC}"
  git status --short
  exit 1
fi

# Ensure we're up to date
echo -e "${YELLOW}📡 Fetching latest changes...${NC}"
git fetch origin main --quiet

LOCAL=$(git rev-parse main)
REMOTE=$(git rev-parse origin/main)
if [ "$LOCAL" != "$REMOTE" ]; then
  echo -e "${RED}❌ Error: Local main is not up to date with origin/main${NC}"
  echo -e "${YELLOW}   Run: git pull origin main${NC}"
  exit 1
fi

echo -e "${GREEN}✓ On main branch and up to date${NC}"
echo ""

# Preview version (dry run to determine next version)
echo -e "${YELLOW}🔍 Analyzing commits to determine next version...${NC}"

# Create a temporary script to capture Lerna output
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

cd "$(git rev-parse --show-toplevel)"

# Run Lerna version in dry-run mode
LERNA_OUTPUT=$(yarn lerna version \
  --conventional-commits \
  --conventional-prerelease \
  --preid test \
  --no-git-tag-version \
  --no-push \
  --yes \
  2>&1 || true)

# Extract version from output
# Look for lines like "lerna info versioning independent" or package version changes
NEXT_VERSION=$(echo "$LERNA_OUTPUT" | grep -oP 'v?\d+\.\d+\.\d+(-test\.\d+)?' | head -1)

# Clean up the dry run (restore package.json files)
# Check if cleanup would remove untracked files
if [ -n "$(git status --porcelain | grep '^??')" ]; then
  echo -e "${YELLOW}⚠️  Warning: Untracked files detected before cleanup${NC}"
  git status --short
  echo -e "${RED}❌ Error: Cannot proceed with untracked files present${NC}"
  exit 1
fi
git checkout -- . 2>/dev/null || true
git clean -fd 2>/dev/null || true

if [ -z "$NEXT_VERSION" ]; then
  echo -e "${RED}❌ Error: Could not determine next version${NC}"
  echo -e "${YELLOW}Lerna output:${NC}"
  echo "$LERNA_OUTPUT"
  exit 1
fi

# Remove -test.X suffix and 'v' prefix for branch name
BASE_VERSION=$(echo "$NEXT_VERSION" | sed 's/-test.*//' | sed 's/^v//')

echo ""
echo -e "${GREEN}📌 Next version will be: ${BLUE}v$BASE_VERSION-test.0${NC}"
echo ""

# Show what commits will be included
echo -e "${YELLOW}📝 Commits since last release:${NC}"
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
if [ -n "$LAST_TAG" ]; then
  echo -e "${BLUE}   From: $LAST_TAG${NC}"
  git log $LAST_TAG..HEAD --oneline --pretty=format:"   %C(yellow)%h%Creset %s" | head -10
  COMMIT_COUNT=$(git rev-list $LAST_TAG..HEAD --count)
  if [ $COMMIT_COUNT -gt 10 ]; then
    echo -e "${YELLOW}   ... and $((COMMIT_COUNT - 10)) more commits${NC}"
  fi
else
  echo -e "${YELLOW}   No previous tags found${NC}"
  git log --oneline --pretty=format:"   %C(yellow)%h%Creset %s" | head -10
fi
echo ""

# If dry run, stop here
if [ "$DRY_RUN" = true ]; then
  echo -e "${GREEN}✓ Dry run complete - no changes made${NC}"
  echo ""
  echo -e "${BLUE}To create the release branch, run:${NC}"
  echo -e "   ${YELLOW}./tools/create-release-branch.sh${NC}"
  exit 0
fi

# Interactive confirmation
BRANCH_NAME="release/v$BASE_VERSION"
echo -e "${YELLOW}Ready to create release branch: ${BLUE}$BRANCH_NAME${NC}"
echo ""
echo "This will:"
echo "  1. Create branch: $BRANCH_NAME"
echo "  2. Push to origin"
echo "  3. Trigger GitHub Actions to:"
echo "     - Version packages to v$BASE_VERSION-test.0"
echo "     - Create tag v$BASE_VERSION-test.0"
echo "     - Deploy to prodtest environment"
echo ""
read -p "$(echo -e ${YELLOW}Continue? [y/N]:${NC} )" -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${RED}❌ Cancelled${NC}"
  exit 1
fi

# Create and push branch
echo ""
echo -e "${YELLOW}📦 Creating release branch...${NC}"
git checkout -b "$BRANCH_NAME"

echo -e "${YELLOW}⬆️  Pushing to origin...${NC}"
git push origin "$BRANCH_NAME"

echo ""
echo -e "${GREEN}✅ Release branch created successfully!${NC}"
echo ""
echo -e "${BLUE}Branch:${NC} $BRANCH_NAME"
echo -e "${BLUE}Next steps:${NC}"
echo "  1. ⏳ Wait for GitHub Actions to complete versioning"
echo "  2. 🧪 Monitor prodtest deployment"
echo "  3. 🏷️  After testing, promote with:"
echo "     git tag v$BASE_VERSION-beta.0 v$BASE_VERSION-test.0"
echo "     git tag v$BASE_VERSION v$BASE_VERSION-beta.0"
echo "  4. 🔀 After production release, merge back:"
echo "     git checkout main && git merge $BRANCH_NAME"
echo ""
