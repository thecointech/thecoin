var defaults = require('@thecointech/jestutils/config');
const { cwd } = require('process');
const path = require('path');

const getRootForSingleTest = () => {
  // When running test from VSCode, scope the root to just the package being tested
  const testPathArg = process.argv.indexOf('--runTestsByPath');
  if (testPathArg >= 0) {
    const testPath = process.argv[testPathArg + 1];
    const relativeTestPath = path.relative(cwd(), testPath);
    return relativeTestPath.split(path.sep).slice(0, 2).join(path.sep);
  }
}
defaults.roots[1] = getRootForSingleTest() ?? "./"

module.exports = defaults
