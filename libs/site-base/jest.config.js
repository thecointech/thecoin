const defaults = require('../../jest.config');

module.exports = {
  ...defaults,
  testEnvironment: 'jsdom',
  moduleDirectories: ['node_modules', '../../node_modules', 'src'],
  moduleNameMapper: {
    ...defaults.moduleNameMapper,
    "@thecointech/site-semantic-theme/variables": '<rootDir>/internals/testing/styleMock.js',
    "^components/(.*)": "<rootDir>/src/components/$1",
    "^containers/(.*)": "<rootDir>/src/containers/$1",
    "^api/(.*)": "<rootDir>/src/api/$1",
    '\\.(css|less|svg)$': '<rootDir>/internals/testing/styleMock.js',
  }
};
