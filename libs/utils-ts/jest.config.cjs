const defaults = require('@thecointech/jestutils/config');

module.exports = {
  ...defaults,
  testPathIgnorePatterns: [
    "/node_modules/",
    "VerifiedAction.test.ts",
  ]
};
