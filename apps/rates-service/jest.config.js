const defaults = require('../../jest.config');

module.exports = {
  ...defaults,
  setupFilesAfterEnv: ['./src/setupLuxon.ts'],
  collectCoverageFrom: [
    'src/internals/**/*.ts'
  ],
};
