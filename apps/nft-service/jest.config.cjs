const defaults = require('@thecointech/jestutils/config');

module.exports = {
  ...defaults,
  collectCoverageFrom: [
    'src/internals/**/*.ts'
  ],
};
