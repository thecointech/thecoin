const { cwd } = require('process');
const path = require('path');
const { existsSync } = require('fs');

// When running test from VSCode, scope the root to just the package being tested
function getPackagePath() {
  const testPathArg = process.argv.indexOf('--runTestsByPath');
  if (testPathArg >= 0) {
    const testPath = process.argv[testPathArg + 1];
    const relativeTestPath = path.relative(cwd(), testPath);
    return relativeTestPath.split(path.sep).slice(0, 2).join(path.sep);
  }
}

function getDefaults() {
  const packagePath = getPackagePath();
  if (packagePath) {
    if (existsSync(path.join(packagePath, "jest.config.cjs"))) {
      return require(path.join(cwd(), packagePath, "jest.config.cjs"));
    }
  }
  console.warn("No jest config found in package path: ", packagePath);
  return require("@thecointech/jestutils/config");
}

function getConfig() {
  const jestConfig = getDefaults();
  const packageRoot = getPackagePath() ?? "./";
  jestConfig.roots = jestConfig.roots.map(root => root.replace("<rootDir>", packageRoot))
  return jestConfig;
}

module.exports = getConfig()
