const defaults = require('../../jest.config');

module.exports = {
  ...defaults,
  transformIgnorePatterns: [
    "node_modules/(?!(3id-connect|my-project|react-native-button)/)"
  ]
};
