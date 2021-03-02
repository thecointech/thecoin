'use strict';
// Allow using typescript in deployments
require("ts-node").register({
  project: "tsconfig.migrate.json",
  files: true,
});

var path = require('path');

module.exports = {
  // We output into our src directory so we can directly import
  // the JSON artifacts into our TS code.
  contracts_build_directory: path.join(__dirname, "src", "contracts"),

  networks: {
    development: {
      host: "127.0.0.1",
      port: 9545,
      network_id: "*",
    },
    // TODO: test deployment to ropsten (this seems... wrong)
    ropsten: {
      host: 'localhost',
      port: 9545,
      network_id: '*'
    }
  },
  compilers: {
    solc: {
      version: "^0.6.0",  // ex:  "0.4.20". (Default: Truffle's installed solc)
      docker: false,
      settings: {
       optimizer: {
         enabled: true,
         runs: 200
       },
       evmVersion: "byzantium"
      }
    }
  }
};
