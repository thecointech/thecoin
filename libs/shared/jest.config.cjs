const defaults = require('@thecointech/jestutils/config');

module.exports = {
  ...defaults,
  testEnvironment: "jsdom",
};
