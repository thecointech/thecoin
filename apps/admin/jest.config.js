const defaults = require('../../jest.config');

module.exports = {
  ...defaults,
  moduleDirectories: ['node_modules', '../../node_modules', 'app'],
  roots: [
    defaults.roots[0],
    '<rootDir>/app',
  ],
};