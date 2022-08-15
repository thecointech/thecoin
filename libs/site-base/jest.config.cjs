const defaults = require('@thecointech/jestutils/config');

module.exports = {
  ...defaults,
  testEnvironment: 'jsdom',
  moduleDirectories: ['node_modules', '../../node_modules', 'src'],
  moduleNameMapper: {
    ...defaults.moduleNameMapper,
    "^components/(.*)": "<rootDir>/src/components/$1",
    "^containers/(.*)": "<rootDir>/src/containers/$1",
  }
};
