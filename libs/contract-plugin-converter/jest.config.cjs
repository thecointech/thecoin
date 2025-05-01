const defaults = require('@thecointech/jestutils/config');

process.env.HARDHAT_VERBOSE = "true"
process.env.DEBUG = "true"
module.exports = {
  ...defaults,
  // disable contract tests until we can figure out how to run them under ESM
  roots: [...defaults.roots, "<rootDir>/contracts", "<rootDir>/scripts"],
};
