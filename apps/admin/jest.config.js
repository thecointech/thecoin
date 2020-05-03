const {defaults} = require('../../jest.config');

module.exports = {
  ...defaults,

  testPathIgnorePatterns: [
    "/node_modules/",
    "/RbcApi/"
  ]
};
