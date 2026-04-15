# Testing Tag-Based Deployment (Phase 2)

## 🎯 Objective
Test the new tag-based deployment system in parallel with existing branch-based deployments for the **next deployment**.

## ✅ Phase 1 Complete
- [x] Lerna configured to allow main/dev branches
- [x] `deploy-on-tag.yml` workflow created
- [x] `action-smoke-tests.yml` workflow created
- [x] Release script available: `tools/create-release-branch.sh`
- [x] Migration plan documented

## 📝 How to Test Your Next Deployment

### Option A: Manual Tag Creation (Recommended for First Test)

**When you're ready to deploy:**

1. **Merge your changes to `dev` as usual**
   ```bash
   # Your normal process - merge PR to dev
   ```

2. **Create a test tag manually**
   ```bash
   # Get the latest commit from dev
   git checkout dev
   git pull origin dev

   # Create and push a test tag
   git tag v0.5.3-test.0
   git push origin v0.5.3-test.0
   ```

3. **Watch the deployment**
   - Go to GitHub Actions: https://github.com/thecointech/thecoin/actions
   - Look for "Deploy on Tag" workflow
   - It will:
     - Build and test
     - Deploy to prodtest environment
     - Run smoke tests
     - Show success/failure

4. **Verify deployment**
   - Check that sites are live
   - Check that services are responding
   - Smoke tests should pass automatically

5. **If successful, you can also deploy via the old method**
   - Create PR from dev → publish/prodtest (old way)
   - Compare both deployments
   - This validates tag-based works in parallel

### Option B: Automatic Tag Creation from Release Branch

**Once you create a release branch:**

1. **Create release branch**
   ```bash
   # Run the release script
   ./tools/create-release-branch.sh

   # The script will:
   # 1. Analyze commits with Lerna
   # 2. Show you the version it will create (e.g., v0.6.0)
   # 3. Ask for confirmation
   # 4. Create branch: release/v0.6.0
   # 5. Push to origin
   # 6. Trigger GitHub Actions on the release branch
   ```

2. **Verify tag creation**
   ```bash
   # Fetch the new tag
   git fetch --tags

   # List recent tags
   git tag --sort=-version:refname | head -5

   # You should see the new tag (e.g., v0.6.0-test.0)

   # Check release branch
   git fetch origin
   git checkout release/v0.6.0
   git log -1  # Should show "chore(release): publish 0.6.0-test.0"
   ```

3. **Watch the deployment**
   - Go to GitHub Actions: https://github.com/thecointech/thecoin/actions
   - Look for "Deploy on Tag" workflow
   - It will:
     - Build and test
     - Deploy to prodtest environment
     - Run smoke tests
     - Show success/failure

4. **Verify deployment**
   - Check that sites are live
   - Check that services are responding
   - Smoke tests should pass automatically

## 🧪 Testing Checklist

For your next deployment, verify:

- [ ] Tag triggers `deploy-on-tag.yml` workflow
- [ ] Build completes successfully
- [ ] Tests pass
- [ ] Docker images pushed with environment-specific tags
- [ ] Services deployed to correct environment
- [ ] Sites deployed to correct environment
- [ ] Smoke tests pass (new!)
- [ ] All services responding

## 🎨 Tag Patterns

| Tag Pattern | Environment | Example |
|-------------|-------------|---------|
| `v*.*.*-test.*` | prodtest | `v0.5.3-test.0` |
| `v*.*.*-beta.*` | prodbeta | `v0.5.3-beta.0` |
| `v*.*.*` | prod | `v0.5.3` |

## 🔄 Promotion Path

**Publish-Once, Promote-By-Reference Strategy:**

```
v0.5.3-test.0 (prodtest)
  ├─ Publishes NPM packages: @thecointech/package@0.5.3-test.0
  ├─ Builds Docker images: tx-processor:prodtest-abc123
  └─ Deploys sites with CONFIG_NAME=prodtest

v0.5.3-beta.0 (prodbeta)
  ├─ Reuses packages: @thecointech/package@0.5.3-test.0
  ├─ Retags Docker images: tx-processor:prodbeta-abc123 (same image!)
  └─ Rebuilds sites with CONFIG_NAME=prodbeta

v0.5.3 (production)
  ├─ Graduates packages: @thecointech/package@0.5.3 (from -test.0)
  ├─ Builds new Docker image: tx-processor:prod-abc123
  └─ Rebuilds sites with CONFIG_NAME=prod
```

**Key Benefits:**
- ✅ **What you test is what you deploy** - Beta uses exact same NPM packages as test
- ✅ **Fast promotions** - Beta reuses Docker images, no rebuild needed
- ✅ **Sites rebuilt** - Each environment gets fresh site build with correct CONFIG_NAME

**To promote test → beta:**
```bash
# Ensure you have latest tags
git fetch --tags

# Create beta tag pointing to same commit
git tag v0.6.0-beta.0 v0.6.0-test.0
git push origin v0.6.0-beta.0

# This will:
# - Skip package publishing (reuses -test.0 packages)
# - Retag Docker images (pulls prodtest image, tags as prodbeta)
# - Rebuild sites with CONFIG_NAME=prodbeta
```

**To promote beta → prod:**
```bash
# Create production tag
git tag v0.6.0 v0.6.0-beta.0
git push origin v0.6.0

# This will:
# - Graduate packages from 0.5.3-test.0 → 0.5.3
# - Build fresh Docker images for production
# - Rebuild sites with CONFIG_NAME=prod
```

## 🔀 Merge Release Branch Back

After successful production deployment:

```bash
# Merge release branch back to main
git checkout main
git pull origin main
git merge release/v0.6.0
git push origin main

# Optionally sync to dev
git checkout dev
git merge main
git push origin dev

# Delete release branch
git branch -d release/v0.6.0
git push origin --delete release/v0.6.0
```

## 🚨 Rollback Test

After a successful deployment, test rollback:

```bash
# Redeploy a previous tag
git push origin v0.5.3-test.0:refs/tags/v0.5.3-test.0 --force

# Or create new version tag pointing to old commit
git tag v0.5.4-test.0 <old-commit-sha>
git push origin v0.5.4-test.0
```

## 📊 Monitoring

**During deployment, watch:**
- GitHub Actions progress
- Firebase deployment logs
- Google App Engine deployment status
- Smoke test results (new!)

**After deployment, verify:**
- Services are responding
- No errors in logs
- Version numbers are correct

## ⚠️ Troubleshooting

### Tag doesn't trigger deployment
- Check tag name matches pattern (`v*.*.*-test.*`)
- Verify `deploy-on-tag.yml` exists in `.github/workflows/`
- Check GitHub Actions permissions

### Smoke tests fail
- Check URLs in `action-smoke-tests.yml` match your environment
- Verify environment variables are set correctly
- Services may need a `/health` endpoint (currently optional)

### Lerna fails to create tag
- Verify `lerna.json` allows the current branch
- Check `GH_TOKEN` has correct permissions
- Ensure conventional commits are in commit history

## ✅ Success Criteria

Mark deployment as successful if:
- [x] Tag triggered workflow automatically
- [x] All jobs completed successfully
- [x] Services deployed and responding
- [x] Smoke tests passed
- [x] No manual intervention needed

## 📝 Next Steps After Successful Test

1. Update `deployment-migration.md` checklist
2. Run 2 more test deployments for confidence
3. Test beta environment deployment
4. Test rollback procedure
5. Once comfortable, proceed to Phase 3 (cutover to main branch)

---

**Current Status:** Ready to test on next deployment
**Reference:** See full migration plan in `deployment-migration.md`
