const defaults = require('@thecointech/jestutils/config');
const { join } = require('path');

module.exports = {
  ...defaults,
  collectCoverageFrom: [
    'src/internals/**/*.ts'
  ],
  moduleDirectories: [
    join(__dirname,'__mocks__'),
    ...defaults.moduleDirectories
  ]
};
