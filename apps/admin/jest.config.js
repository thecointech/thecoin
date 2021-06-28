const defaults = require('../../jest.config');

module.exports = {
  ...defaults,
  moduleDirectories: ['node_modules', '../../node_modules', 'app'],
  roots: [
    '<rootDir>/app',
    defaults.roots[1],
  ],
};
