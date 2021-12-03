const defaults = require('../../jest.config');

module.exports = {
  ...defaults,
  roots: [...defaults.roots, "<rootDir>/contracts", "<rootDir>/migrations"]
};
