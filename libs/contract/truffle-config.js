'use strict';
var path = require('path');
const HDWalletProvider = require("@truffle/hdwallet-provider");
// Allow using typescript in deployments
loadTypescript();
// Load environment for the network we are deploying to
require('../../tools/setenv');

module.exports = {
  // We output into our src directory so we can directly import
  // the JSON artifacts into our TS code.
  contracts_build_directory: path.join(__dirname, "src", "contracts"),

  networks: {
    // dev:live environment
    development: {
      host: "127.0.0.1",
      port: process.env.DEPLOY_NETWORK_PORT,
      network_id: "*",
    },
    // prod:test environment
    prodtest: {
      provider: () => {
        // Load config variables.

        return new HDWalletProvider(
          process.env.WALLET_Owner_MNEMONIC,
          `https://${process.env.DEPLOY_NETWORK}.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
        );
      },
      network_id: '*', // eslint-disable-line camelcase
      gasPrice: 1000,
      skipDryRun: true
    },
    // TODO: we are stuck on ropsten till the price of gas comes down.
    ropsten: {
      host: 'localhost',
      port: 9545,
      network_id: '*'
    },

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

function loadTypescript() {
  require("ts-node").register({
    project: "tsconfig.migrate.json",
    files: true,
  });
}
