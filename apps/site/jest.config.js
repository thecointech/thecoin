const defaults = require('../../jest.config');

module.exports = {
  ...defaults,
  moduleDirectories: ['node_modules', '../../node_modules', 'app'],
  preset: "ts-jest/presets/js-with-babel",
  setupFilesAfterEnv: [
    "<rootDir>/internals/testing/setupTests.js"
  ],
  moduleNameMapper: {
    '\\.(css|less|svg)$': '<rootDir>/internals/testing/styleMock.js',
  }
};
