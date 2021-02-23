const defaults = require('../../jest.config');

module.exports = {
  ...defaults,
  testEnvironment: "jsdom",
  transformIgnorePatterns: [
    "node_modules/(?!(3id-connect|my-project|react-native-button)/)"
  ],
};
