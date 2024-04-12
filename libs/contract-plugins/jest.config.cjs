const defaults = require('@thecointech/jestutils/config');

module.exports = {
  ...defaults,
  // disable contract tests until we can figure out how to run them under ESM
  roots: [...defaults.roots, "<rootDir>/contracts", "<rootDir>/scripts"]
};
