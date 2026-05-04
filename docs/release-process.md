# Release Process Guide

This document describes the complete release process using release branches and tag-based deployment.

## 📋 Overview

**Release Strategy:**
- Development happens on `main` branche
- Releases are isolated in short-lived `release/*` branches
- Tags trigger deployments to environments
- Version numbers are determined by conventional commits

## 🚀 Creating a New Release

### Step 1: Preview the Release (Dry Run)

Before creating a release branch, preview what version Lerna will create:

```bash
# Ensure you're on main
git checkout main
git pull origin main

# Preview the next version
./tools/create-release-branch.sh --dry-run
```

**Output will show:**
- Next version number (e.g., v0.6.0)
- Commits that will be included
- Whether it's a patch, minor, or major release

**Version is determined by your commit messages:**
- `fix:` commits → patch version (0.5.3 → 0.5.4)
- `feat:` commits → minor version (0.5.3 → 0.6.0)
- `feat!:` or `BREAKING CHANGE:` → major version (0.5.3 → 1.0.0)

### Step 2: Create Release Branch

Run the automated script:

```bash
./tools/create-release-branch.sh
```

**The script will:**
1. ✅ Verify you're on `main` branch
2. ✅ Check working tree is clean
3. ✅ Ensure you're up-to-date with origin
4. 🔍 Analyze commits with Lerna
5. 📌 Show you the version (e.g., v0.6.0)
6. 📝 List commits since last release
7. ❓ Ask for confirmation
8. 🌳 Create branch `release/v0.6.0`
9. ⬆️ Push to origin
10. 🚀 Trigger GitHub Actions

**What happens automatically:**
- GitHub Actions runs on the release branch
- Lerna versions all packages to `0.6.0-test.0`
- Package.json files updated with new versions
- Inter-dependencies updated (e.g., broker-service → utilities@0.6.0-test.0)
- Commit created: `chore(release): publish 0.6.0-test.0`
- Tag created: `v0.6.0-test.0`
- Tag triggers deployment to **prodtest**

### Step 3: Monitor Initial Deployment

```bash
# Watch GitHub Actions
# https://github.com/thecointech/thecoin/actions

# Check deployment logs:
# 1. "Release Branch Versioning" - Creates tag
# 2. "Deploy on Tag" - Deploys to prodtest
# 3. "Smoke Tests" - Validates deployment
```

**What gets deployed:**
- ✅ NPM packages published: `@thecointech/package@0.6.0-test.0`
- ✅ Docker images built: `tx-processor:prodtest-<sha>`
- ✅ Services deployed to prodtest
- ✅ Sites deployed to prodtest with CONFIG_NAME=prodtest
- ✅ Smoke tests run automatically

## 🐛 Fixing Bugs During Testing

If you find bugs in prodtest:

```bash
# Work on the release branch
git checkout release/v0.6.0

# Fix the bug
git commit -m "fix: critical bug in export feature"

# Push to release branch
git push origin release/v0.6.0

# GitHub Actions will:
# - Version to 0.6.0-test.1 (increments test number)
# - Create tag v0.6.0-test.1
# - Redeploy to prodtest
```

**Version increments:**
- First release: `v0.6.0-test.0`
- After bug fix: `v0.6.0-test.1`
- After another fix: `v0.6.0-test.2`
- etc.

## ⬆️ Promoting Through Environments

### Promote to Beta (prodbeta)

Once prodtest is stable:

```bash
# Ensure you have latest tags
git fetch --tags

# Find your test tag (use the latest if you had fixes)
git tag --sort=-version:refname | grep "v0.6.0-test"
# Example output: v0.6.0-test.2

# Create beta tag pointing to the same commit
git tag v0.6.0-beta.0 v0.6.0-test.2
git push origin v0.6.0-beta.0
```

**What happens:**
- ⏭️ Skips package publishing (reuses test packages)
- 🔄 Retags Docker images (same image, new tag)
- ✅ Rebuilds sites with CONFIG_NAME=prodbeta
- 🚀 Deploys to prodbeta environment

**Key point:** Beta uses the **exact same NPM packages and Docker images** that were tested in prodtest!

### Promote to Production (prod)

After beta validation:

```bash
# Create production tag
git tag v0.6.0 v0.6.0-beta.0
git push origin v0.6.0
```

**What happens:**
- ✅ Graduates NPM packages: `0.6.0-test.2` → `0.6.0`
- ✅ Builds fresh Docker images for production
- ✅ Rebuilds sites with CONFIG_NAME=prod
- 🚀 Deploys to production environment

## 🔀 Merging Back to Main

### Automatic PR Creation ⭐

After you push a production tag, GitHub Actions **automatically creates a PR** to merge the release branch back to main:

```bash
# When you promote to production:
git tag v0.6.0 v0.6.0-beta.0
git push origin v0.6.0

# GitHub Actions automatically:
# 1. Finds the release/v0.6.0 branch
# 2. Creates a PR: release/v0.6.0 → main
# 3. Labels it as "release" and "automerge-candidate"
# 4. Includes summary of what's being merged
```

**Check your PRs:**
- Go to: https://github.com/thecointech/thecoin/pulls
- Look for: "🚀 Release 0.6.0 - Merge back to main"
- Review the changes (should be version bumps + any bug fixes)
- Merge the PR

### Manual Merge (If Needed)

If the automatic PR fails or you prefer manual merging:

```bash
# Merge release branch back to main
git checkout main
git pull origin main
git merge release/v0.6.0
git push origin main
```

### Cleanup

```bash
# Delete the release branch (after PR is merged)
git branch -d release/v0.6.0
git push origin --delete release/v0.6.0
```

**Why merge back:**
- ✅ Brings version commits to main
- ✅ Includes any bug fixes made during testing
- ✅ Keeps main in sync with production
- ✅ main now shows `"version": "0.6.0"` in package.json

**After merge:**
- `main` branch: version 0.6.0
- Next release will start from 0.6.0

## 🚨 Hotfixes

If a critical bug is found in production:

### Option 1: Hotfix on Main

```bash
# Create hotfix branch from main
git checkout main
git checkout -b hotfix/critical-security-issue

# Fix the bug
git commit -m "fix: critical security vulnerability"

# Merge to main
git checkout main
git merge hotfix/critical-security-issue
git push origin main

# Create release branch for hotfix
./tools/create-release-branch.sh
# This will create v0.6.1-test.0

# Fast-track to production
git tag v0.6.1 v0.6.1-test.0
git push origin v0.6.1
```

### Option 2: Hotfix from Release Tag

```bash
# Create new release branch from production tag
git checkout -b release/v0.6.1 v0.6.0
git push origin release/v0.6.1

# Fix the bug
git commit -m "fix: critical security vulnerability"
git push origin release/v0.6.1

# GitHub Actions creates v0.6.1-test.0
# Fast-track to production if needed
git tag v0.6.1 v0.6.1-test.0
git push origin v0.6.1

# Merge back to main
git checkout main
git merge release/v0.6.1
git push origin main
```

## 📊 Version Number Examples

**Patch Release (Bug Fixes Only):**
```
Current: v0.5.3
Commits: fix: login timeout, fix: timezone
Next:    v0.5.4-test.0
```

**Minor Release (New Features):**
```
Current: v0.5.3
Commits: feat: dark mode, fix: bug
Next:    v0.6.0-test.0
```

**Major Release (Breaking Changes):**
```
Current: v0.5.3
Commits: feat!: new authentication
Next:    v1.0.0-test.0
```

## 🔄 Complete Release Flow Example

```
┌─────────────────────────────────────────┐
│ Development Phase                        │
│ - Work on main                       │
│ - Merge features                         │
│ - main stays at v0.5.3                   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ Create Release Branch                    │
│ $ ./tools/create-release-branch.sh       │
│ → Creates release/v0.6.0                 │
│ → Auto-versions to v0.6.0-test.0         │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ Test in Prodtest                         │
│ - Deploy via v0.6.0-test.0 tag           │
│ - Find bugs, fix on release branch       │
│ - Creates v0.6.0-test.1, v0.6.0-test.2   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ Promote to Beta                          │
│ $ git tag v0.6.0-beta.0 v0.6.0-test.2    │
│ → Reuses test packages/images            │
│ → Deploys to prodbeta                    │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ Promote to Production                    │
│ $ git tag v0.6.0 v0.6.0-beta.0           │
│ → Graduates packages to 0.6.0            │
│ → Deploys to production                  │
│ → Auto-creates PR to main ⭐             │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ Merge Back (Automated PR)                │
│ → Review PR on GitHub                    │
│ → Merge PR to main                       │
│ → Delete release branch                  │
│ → main now at v0.6.0                     │
└─────────────────────────────────────────┘
```

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Preview next version | `./tools/create-release-branch.sh --dry-run` |
| Create release | `./tools/create-release-branch.sh` |
| Fix bug in release | Work on `release/v*` branch and push |
| Promote to beta | `git tag v0.6.0-beta.0 v0.6.0-test.X` |
| Promote to prod | `git tag v0.6.0 v0.6.0-beta.0` |
| Merge back | Auto-creates PR, review & merge on GitHub |
| Delete release branch | `git push origin --delete release/v0.6.0` |

## 📝 Best Practices

✅ **DO:**
- Use conventional commits (`feat:`, `fix:`, `feat!:`)
- Preview version before creating release branch
- Test thoroughly in prodtest before promoting
- Merge release branch back to main after production deployment
- Delete release branches after merging

❌ **DON'T:**
- Manually edit version numbers in package.json
- Skip environments (always test → beta → prod)
- Leave old release branches unmerged
- Push directly to main (use PRs)

## 🆘 Troubleshooting

**Q: Script says "No previous tags found"**
- A: First release - this is normal, continue

**Q: Lerna creates wrong version number**
- A: Check your commit messages follow conventional commits format

**Q: Can't create release branch (working tree dirty)**
- A: Commit or stash your changes first

**Q: Want to manually set version**
- A: Not recommended, but you can run `yarn lerna version` manually

**Q: Need to support multiple release lines (0.5.x and 0.6.x)**
- A: Create multiple release branches and cherry-pick fixes as needed
