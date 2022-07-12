require('ts-node').register({
  project: `${__dirname}/tsconfig.json`,
})

module.exports = require(`./1_initial_migration.ts`)(artifacts, web3);
