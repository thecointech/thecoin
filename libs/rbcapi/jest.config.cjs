const defaults = require('@thecointech/jestutils/config');
module.exports = {
  ...defaults,
  setupFiles: [
    ...defaults.setupFiles,
    __dirname + "/jest.prodenv.cjs"
  ]
}
