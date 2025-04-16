const defaults  = require('@thecointech/jestutils/config');

defaults.roots = [
  ...defaults.roots,
  '<rootDir>/projectUrl'
]

module.exports = defaults;
