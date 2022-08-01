require('ts-node').register({
  project: `${__dirname}/migrations/tsconfig.json`,
})

module.exports = require("@thecointech/contract-tools/truffle")
