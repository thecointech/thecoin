# Deployment Migration Plan

## Progress Tracker

### Phase 1: Infrastructure ✅ COMPLETE
- [x] Update Lerna configuration to allow `main` and `dev` branches
- [x] Create `deploy-on-tag.yml` workflow
- [x] Create `action-smoke-tests.yml` workflow
- [x] Implement publish-once, promote-by-reference for packages/Docker
- [x] Update smoke tests to use environment variables from config files

### Phase 2: Release Branches ✅ COMPLETE
- [x] Remove auto-versioning from main branch
- [x] Create `release-branch.yml` workflow
- [x] Create `tools/create-release-branch.sh` script (with --dry-run)
- [x] Document release process
- [x] Update testing documentation

### Phase 3: Testing 🔄 READY FOR TESTING
- [ ] User previews next version with dry-run script
- [ ] User creates first release branch
- [ ] Verify auto-versioning on release branch
- [ ] Test deployment to prodtest
- [ ] Test promotion to beta
- [ ] Test promotion to production
- [ ] Verify merge back to main

### Phase 4: Migration
- [ ] Validate release branch workflow in production
- [ ] Deprecate branch-based workflows (publish/*)
- [ ] Archive old workflows
- [ ] Update team documentation
- [ ] Workflows updated
- [ ] Lerna config locked to main only
- [ ] First production deploy via tag

### Phase 4 Checklist (Cleanup)
- [ ] 2-week deprecation period complete
- [ ] Old workflows archived
- [ ] Publish branches deleted
- [ ] Documentation updated

---

## 📊 Current State Analysis
Active publish branches:

origin/publish/prod
origin/publish/prodbeta
origin/publish/prodtest
Current Lerna config:

Only allows publishing from publish/* branches
Version bumps create commits on publish branches
Requires merge-back automation to sync with dev
Current workflow:

PR to publish/prodtest → triggers deployment
Lerna bumps version on publish/prodtest
Auto-PR created to merge back to dev
🎯 Target State
Single source of truth: main branch (rename from dev)

Tag-based deployment:

v1.2.3-test.0    → prodtest environment
v1.2.3-beta.0    → prodbeta environment
v1.2.3           → prod environment
Benefits:

✅ No merge-back automation needed
✅ Clear deployment history via git tags
✅ Easy rollback (redeploy any tag)
✅ Version bumps happen on main, no branch divergence
📅 Migration Phases
Phase 1: Preparation (Week 1)
Goal: Set up parallel infrastructure without disrupting current deployments

1.1 Update Lerna Configuration

```json
{
  "command": {
    "version": {
      "allowBranch": ["main", "publish/*"],  // Add main temporarily
      "createRelease": "github",  // NEW: Auto-create GitHub releases
      "message": "chore(release): publish %s [skip ci]"  // Add skip ci
    },
    "publish": {
      "allowBranch": ["main", "publish/*"]
    }
  }
}
```

1.2 Create New Tag-Based Workflows
New files to create:

.github/workflows/deploy-on-tag.yml - Main tag deployment orchestrator
.github/workflows/validate-tag.yml - Tag format validation
.github/workflows/create-release-tag.yml - Manual tag creation helper
1.3 Branch Protection Updates
Protect main branch (same rules as dev)
Require status checks to pass
Require PR reviews
1.4 Documentation
Create docs/deployment-guide.md
Document new tag-based process
Create runbook for common scenarios
Deliverables:

Updated lerna.json
New workflow files created (not yet active)
Branch protection configured
Documentation written
Team training scheduled
Phase 2: Parallel Testing (Week 2-3)
Goal: Test tag-based deployments alongside existing branch deployments

2.1 Deploy to Test Environment via Tags

```bash
# After merging to main, create test tag manually
git tag v0.5.3-test.0
git push origin v0.5.3-test.0
```

This triggers new deploy-on-tag.yml workflow in parallel to existing system.

2.2 Validation Checklist
Tag triggers correct environment deployment
Build artifacts are correctly generated
Services deploy successfully
Sites deploy successfully
Docker images pushed with correct tags
No interference with branch-based deployments
Smoke tests pass
2.3 Test Rollback

```bash
# Simulate rollback by redeploying old tag
git push origin v0.5.2-test.0:refs/tags/v0.5.2-test.0 --force
```

Verify rollback workflow works correctly.

2.4 Test All Environments
Deploy to prodtest via v*.*.*-test.* tag
Deploy to prodbeta via v*.*.*-beta.* tag
Deploy to prod via v*.*.* tag (use a pre-existing version)
Deliverables:

3+ successful tag deployments to prodtest
1+ successful tag deployment to prodbeta
Successful rollback test
Smoke tests validated
Team comfortable with process
Phase 3: Cutover (Week 4)
Goal: Switch to tag-based as primary deployment method

3.1 Pre-Cutover Checklist
All stakeholders notified
Rollback plan documented
Current production state tagged
Team trained on new process
3.2 Rename Branch

```bash
# Locally
git checkout dev
git pull origin dev
git branch -m dev main
git push origin main
git push origin --delete dev
# Update default branch in GitHub settings
# Update branch protection rules
```

3.3 Update All Workflows
Update pr-dev.yml → pr-main.yml (change target branch to main)
Keep old pr-publish-*.yml workflows but add deprecation notices
Make tag workflows the primary deployment path
3.4 Update Lerna to Only Allow Main

```json
{
  "command": {
    "version": {
      "allowBranch": ["main"],  // Remove publish/*
      "createRelease": "github"
    },
    "publish": {
      "allowBranch": ["main"]
    }
  }
}
```

3.5 First Production Deploy via Tags
Merge PR to main
Lerna auto-bumps version and creates tag
Tag triggers deployment
Monitor closely
Deliverables:

Branch renamed to main
All workflows updated
Lerna config updated
First successful production deploy via tags
No rollback needed
Phase 4: Cleanup (Week 5-6)
Goal: Remove old infrastructure once stable

4.1 Deprecation Period (2 weeks)
Keep publish/* branches for emergency rollback
Monitor tag-based deployments
Document any issues
4.2 Archive Old Workflows
Move to .github/workflows-archive/:

pr-publish.yml
pr-publish-prod.yml
pr-publish-prodbeta.yml
pr-publish-prodtest.yml
4.3 Delete Publish Branches

```bash
git push origin --delete publish/prod
git push origin --delete publish/prodbeta
git push origin --delete publish/prodtest
```

4.4 Update Documentation
Remove references to publish branches
Update deployment runbooks
Update onboarding docs
Deliverables:

10+ successful tag deployments
Zero rollbacks needed
Old workflows archived
Publish branches deleted
Documentation updated
🚨 Rollback Plan
If Issues Found in Phase 2 (Testing)
Action: Simply don't proceed to Phase 3. Continue using branch-based deployments.

No impact since systems run in parallel.

If Issues Found in Phase 3 (Cutover)
Action:

Stop creating new tags
Revert lerna.json to allow publish/* branches
Create emergency PR to publish/prod
Continue with branch-based deployments
Fix issues with tag-based approach
Retry cutover when ready
Time to rollback: 15 minutes

If Issues Found in Phase 4 (After Cleanup)
Action:

Recreate publish/* branches from main
Restore archived workflows
Update Lerna config
Time to rollback: 30 minutes

📋 Key Workflow Changes

**New: deploy-on-tag.yml**

```yaml
name: Deploy on Tag
on:
  push:
    tags:
      - 'v*.*.*-test.*'
      - 'v*.*.*-beta.*'
      - 'v*.*.*'
jobs:
  determine-environment:
    runs-on: ubuntu-latest
    outputs:
      environment: ${{ steps.parse.outputs.env }}
      is_prerelease: ${{ steps.parse.outputs.prerelease }}
    steps:
      - id: parse
        run: |
          TAG="${{ github.ref_name }}"
          if [[ "$TAG" =~ -test\. ]]; then
            echo "env=prodtest" >> $GITHUB_OUTPUT
            echo "prerelease=true" >> $GITHUB_OUTPUT
          elif [[ "$TAG" =~ -beta\. ]]; then
            echo "env=prodbeta" >> $GITHUB_OUTPUT
            echo "prerelease=true" >> $GITHUB_OUTPUT
          else
            echo "env=prod" >> $GITHUB_OUTPUT
            echo "prerelease=false" >> $GITHUB_OUTPUT
          fi
  build:
    uses: ./.github/workflows/action-build.yml
  test:
    needs: build
    uses: ./.github/workflows/action-test.yml
  publish-docker:
    needs: test
    uses: ./.github/workflows/action-publish-docker.yml
    secrets: inherit
    with:
      CONFIG_NAME: ${{ needs.determine-environment.outputs.environment }}
      COMMIT_SHA: ${{ github.sha }}
  publish-services:
    needs: test
    uses: ./.github/workflows/action-publish-services.yml
    secrets: inherit
    with:
      CONFIG_NAME: ${{ needs.determine-environment.outputs.environment }}
      COMMIT_SHA: ${{ github.sha }}
  publish-sites:
    needs: test
    uses: ./.github/workflows/action-publish-sites.yml
    secrets: inherit
    with:
      CONFIG_NAME: ${{ needs.determine-environment.outputs.environment }}
      COMMIT_SHA: ${{ github.sha }}
  smoke-tests:
    needs: [publish-services, publish-sites]
    uses: ./.github/workflows/action-smoke-tests.yml
    secrets: inherit
    with:
      CONFIG_NAME: ${{ needs.determine-environment.outputs.environment }}
```

**Updated: pr-main.yml (renamed from pr-dev.yml)**

```yaml
name: Build and Test
on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
jobs:
  build:
    uses: ./.github/workflows/action-build.yml
  test:
    needs: build
    uses: ./.github/workflows/action-test.yml
  # NEW: Auto-version on merge to main
  version:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: write
      packages: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}
      - run: corepack enable
      - uses: actions/setup-node@v4
        with:
          node-version: '22.19'
          cache: 'yarn'
      - name: Configure Git
        run: |
          git config user.name 'GitHub Actions Bot'
          git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
      - name: Install dependencies
        run: yarn install --immutable --mode=skip-build
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-artifacts
      - name: Version and Tag
        run: |
          # For main branch, create test prerelease
          yarn lerna version --conventional-commits \
            --conventional-prerelease \
            --preid test \
            --yes \
            --create-release github
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 🎬 Deployment Workflows After Migration

**Scenario 1: Deploy to Test Environment**

```bash
# 1. Create PR, get reviewed, merge to main
# 2. Auto-version creates tag: v1.2.3-test.0
# 3. Tag automatically triggers deployment to prodtest
# 4. Smoke tests run automatically
```

**Scenario 2: Promote Test → Beta**

```bash
# 1. Manually create beta tag from test tag
git tag v1.2.3-beta.0 v1.2.3-test.0
git push origin v1.2.3-beta.0
# 2. Deployment automatically triggered to prodbeta
```

**Scenario 3: Promote Beta → Production**

```bash
# 1. Graduate prerelease to stable
yarn lerna version --conventional-graduate --yes
# This creates tag v1.2.3
# 2. Deployment automatically triggered to prod
```

**Scenario 4: Hotfix**

```bash
# 1. Create hotfix branch from main
git checkout -b hotfix/critical-bug
# 2. Fix, test, create PR to main
# 3. Merge → auto-creates v1.2.4-test.0
# 4. If urgent, manually create production tag:
git tag v1.2.4 v1.2.4-test.0
git push origin v1.2.4
```

**Scenario 5: Rollback**

```bash
# Simply redeploy previous production tag
git push origin v1.2.2:refs/tags/v1.2.2 --force
# Or create new deployment tag pointing to old commit
git tag v1.2.5 v1.2.2
git push origin v1.2.5
```

## ✅ Success Criteria
All deployments happen via tags
No manual version bumping needed
Clear deployment history in GitHub releases
Rollback time < 5 minutes
Zero merge-back automation
Team confidence in new process
Documentation complete
📊 Risk Assessment
Risk	Probability	Impact	Mitigation
Tag deployment fails	Medium	High	Parallel testing in Phase 2, keep branch deployments
Team confusion	Medium	Low	Training, documentation, gradual rollout
Lerna version issues	Low	Medium	Test thoroughly in Phase 2
Git branch rename issues	Low	High	Coordinate timing, clear communication
Production outage	Low	Critical	Rollback plan, smoke tests, gradual cutover
🎯 Timeline Summary
Week 1: Preparation - workflows, config, docs
Week 2-3: Parallel testing - validate tag deployments
Week 4: Cutover - switch to tags as primary
Week 5-6: Cleanup - remove old infrastructure
Total time: 6 weeks Active development time: ~40 hours Risk level: Low (due to parallel testing)
