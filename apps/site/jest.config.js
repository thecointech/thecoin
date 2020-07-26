const defaults = require('../../jest.config');

module.exports = {
  ...defaults,
  moduleDirectories: ['node_modules', '../../node_modules', 'app'],
  setupFilesAfterEnv: [
    "<rootDir>/internals/testing/setupTests.js"
  ],
  moduleNameMapper: {
    ...defaults.moduleNameMapper,
    '\\.(css|less|svg)$': '<rootDir>/internals/testing/styleMock.js',
  }
};
