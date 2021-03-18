'use strict';
// Allow using typescript in deployments
require("ts-node").register({
  project: "tsconfig.migrate.json",
  files: true,
});
var path = require('path');

// We use ethers infura provider for goerli deployment
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  // We output into our src directory so we can directly import
  // the JSON artifacts into our TS code.
  contracts_build_directory: path.join(__dirname, "src", "contracts"),

  networks: {
    // dev:live environment
    development: {
      host: "127.0.0.1",
      port: 9545,
      network_id: "*",
    },
    // prod:test environment
    prodtest: {
      provider: () => {
        // Load config variables.
        const cfgPath = path.join(__dirname, "..", "..", "environments", "prod.test.env")
        require('dotenv').config({ path: cfgPath })
        return new HDWalletProvider(
          process.env.WALLET_TheCoin_MNEMONIC,
          `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
        );
      },
      network_id: '5', // eslint-disable-line camelcase
      gasPrice: 100,
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
