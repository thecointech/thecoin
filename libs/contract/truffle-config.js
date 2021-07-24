'use strict';
// Load environment for the network we are deploying to
require('../../tools/setenv');
require('../../__mocks__/mock_node');
// Allow using typescript in deployments
loadTypescript();

var path = require('path');
const HDWalletProvider = require("@truffle/hdwallet-provider");
const { AccountId, getSigner } = require('@thecointech/signers');

const numBuiltIn = AccountId.BrokerCAD + 1;
const testAccounts = [];
loadAccounts(numBuiltIn).then(v => testAccounts = v);

module.exports = {
  // We output into our src directory so we can directly import
  // the JSON artifacts into our TS code.
  contracts_build_directory: path.join(__dirname, "src", "contracts"),

  networks: {
    // Applies to both dev & devlive
    develop: {
      blockTime: 1,
    },
    // dev:live environment
    devlive: {
      host: "127.0.0.1",
      port: process.env.DEPLOY_NETWORK_PORT,
      network_id: "*",
    },
    // prod:test environment
    prodtest: {
      provider: () => {
        return new HDWalletProvider(
          testAccounts,
          `https://${process.env.DEPLOY_NETWORK}.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
          0,
          numBuiltIn
        );
      },
      network_id: '*', // eslint-disable-line camelcase
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
        evmVersion: "constantinople"
      }
    }
  }
};

async function loadAccounts(maxIdx) {
  const testAccountKeys = [];
  for (let i = 0; i < maxIdx; i++) {
    const wallet = await getSigner(AccountId[i]);
    if (!wallet)
      throw new Error(`Cannot deploy: missing account ${AccountId[i]}`);
    testAccountKeys.push(wallet.privateKey.slice(2));
  }
  return testAccountKeys;
}

function loadTypescript() {
  require("ts-node").register({
    project: "tsconfig.migrate.json"
  });
}
