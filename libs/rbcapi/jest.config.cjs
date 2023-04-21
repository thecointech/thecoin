const defaults = require('@thecointech/jestutils/config');
module.exports = {
  ...defaults,
  setupFiles: [
    ...defaults.setupFiles,
    "./jest.prodenv.cjs"
  ]
}
