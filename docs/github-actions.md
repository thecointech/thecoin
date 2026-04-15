# Workflow Documentation

## Important Configuration Links

### Release Branch Workflow

**`release-branch.yml`** has a dependency on **`lerna.json`**:

- The `build` job skip condition must match the Lerna commit message
- **lerna.json:** `command.version.message` = `"chore(release): publish %s [skip-release-action]"`
- **release-branch.yml:** `if: "!contains(..., '[skip-release-action]')"`

⚠️ **If you change one, you must update the other!**

### Tag-Based Deployment

**`deploy-on-tag.yml`** is triggered by tags matching:
- `v*.*.*-test.*` → prodtest environment
- `v*.*.*-beta.*` → prodbeta environment
- `v*.*.*` → prod environment

These patterns must stay synchronized with the release process.

## GitHub App Token

**`release-branch.yml`** uses a GitHub App token instead of `GITHUB_TOKEN` to ensure tag pushes can trigger `deploy-on-tag.yml`.

Required secrets:
- `TAG_BOT_APP_ID`
- `TAG_BOT_PRIVATE_KEY`

Without these, tag pushes won't trigger deployments (GitHub Actions prevents `GITHUB_TOKEN` from triggering workflows).
