# Testing

Tests run on Jest. Rather than each package configuring Jest independently, every
package routes through a single shared entry point defined in `libs/jestutils`, so
config, mocks, and setup logic live in one place instead of being duplicated
across ~40 `package.json` files.

## Running tests

- All packages: `yarn test` from the repo root (runs `lerna run test --stream --`
  across every workspace).
- A single package: `yarn test` from inside that package's directory (e.g.
  `cd libs/signers && yarn test`).
- With coverage: most packages expose `yarn test:coverage` (or
  `yarn test:summary`, which writes to `./coverage/summary.txt`) — check the
  package's own `scripts` if you need this, it's not universal.

Under the hood, each package's `test` script is just `run :jest`. `:jest`
(colon-prefixed) is a [Yarn "global script"](https://yarnpkg.com/getting-started/qa#how-to-share-scripts-between-workspaces) —
any script name containing a `:` can be invoked from any workspace, and Yarn
resolves it to wherever it's actually defined, regardless of your cwd. It's
defined once, in `libs/jestutils/package.json`:

```json
":jest": "cd $INIT_CWD && yarn node --no-warnings --experimental-vm-modules $(cd ../.. && yarn bin jest) "
```

`$INIT_CWD` puts you back in the calling package's directory, and
`--experimental-vm-modules` is required because the codebase runs Jest against
native ESM.

## Config resolution

The root `jest.config.cjs` is what most editor Jest integrations should be
pointed at. When invoked with `--runTestsByPath` (which VS Code's Jest
extension does when you run/debug a single test), it inspects the path being
tested, and:
- loads that package's own `jest.config.cjs` if one exists, or
- falls back to the shared default from `@thecointech/jestutils/config`
  (`libs/jestutils/utils/base.config.js`) otherwise.

Most per-package `jest.config.cjs` files are just the shared default with
small overrides, e.g.:

```js
const defaults = require('@thecointech/jestutils/config');
module.exports = {
  ...defaults,
  testPathIgnorePatterns: ["/node_modules/"],
};
```

The shared config (`libs/jestutils/utils/base.config.js`) covers:
- `ts-jest`'s ESM preset, with a custom transformer that **skips type
  checking** for speed (tests type-check via `tsc -b`/CI separately, not via
  Jest) — if this becomes a DX problem, that's the place to revisit.
- `moduleDirectories` including a repo-wide `libs/__mocks__` folder, plus each
  package's own `src`.
- A `globalSetup` that checks whether the Firestore emulator and local
  blockchain emulator are already running (via the ports configured for the
  `devlive` environment) and only wires `FIRESTORE_EMULATOR_PORT` /
  `DEPLOY_NETWORK_PORT` into `process.env` if so — tests that depend on an
  emulator should treat it as unavailable rather than failing outright when
  it's not running locally.
- `jsdom` is opted into per-package (see `libs/redux-intl`, `libs/shared`,
  `libs/site-base`, `apps/site-app`, `apps/site-landing`) rather than globally,
  since most packages are plain Node.

## Editor setup (VS Code)

The repo's `.vscode/settings.json` sets `"jest.autoRun": "off"` (tests are
numerous enough, and some depend on emulators/network state, that auto-running
on every save isn't desirable). Install the "Jest" extension and run tests
on-demand via the CodeLens/test explorer — it picks up the root
`jest.config.cjs` and per-package resolution described above automatically, no
extra `jest.config` path setting should be needed. If your extension isn't
finding tests, double check it's pointed at `jest.config.cjs` (not `.js` — the
config file is CommonJS, since the codegen/tooling that reads it runs outside
ESM).
