const defaults = require('@thecointech/jestutils/config');

const styleMock = '@thecointech/jestutils/styleMock'; //<rootDir>/../../tools/jestStyleMock.js';
module.exports = {
  ...defaults,
  testEnvironment: 'jsdom',
  moduleDirectories: ['node_modules', '../../node_modules', 'src'],
  moduleNameMapper: {
    ...defaults.moduleNameMapper,
    "@thecointech/site-semantic-theme/variables": styleMock,
    "^components/(.*)": "<rootDir>/src/components/$1",
    "^containers/(.*)": "<rootDir>/src/containers/$1",
    "^api/(.*)": "<rootDir>/src/api/$1",
    '\\.(css|less|svg)$': styleMock,
  }
};
