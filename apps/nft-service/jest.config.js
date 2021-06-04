const defaults = require('../../jest.config');

module.exports = {
  ...defaults,
  collectCoverageFrom: [
    'src/internals/**/*.ts'
  ],
};
