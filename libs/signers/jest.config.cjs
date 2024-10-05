const defaults = require('@thecointech/jestutils/config');

module.exports = {
  ...defaults,
  // Disable fromHardware until we get proper support of ESM modules
  testPathIgnorePatterns: [
    "/node_modules/",
  ]
};
