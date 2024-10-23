const defaults = require('@thecointech/jestutils/config');
module.exports = {
  ...defaults,
  setupFiles: [
    ...defaults.setupFiles,
    // NOTE: If the below isn't found, you're probably running with VSCode in "TheCoin" (vs workspace)
    "./jest.prodenv.cjs"
  ]
}
