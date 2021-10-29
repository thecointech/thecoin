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
if (process.env.CONFIG_NAME !== 'devlive') {
  // devlive accounts are hosted on our local blockchain, so already available
  loadAccounts(numBuiltIn).then(v => testAccounts.push(...v)).catch(console.error);
}

const isPolygon = process.env.npm_lifecycle_script?.endsWith("polygon");
const deployType = isPolygon ? "polygon" : "ethereum";

module.exports = {
  // We output into our src directory so we can directly import
  // the JSON artifacts into our TS code.
  contracts_build_directory: path.join(__dirname, "src", "contracts", deployType),

  /**
  * contracts_directory tells Truffle where the contracts you want to compile are located
  */
  contracts_directory: path.join(__dirname, 'contracts', deployType),

  networks: {
    // dev:live environment
    devlive: {
      host: "127.0.0.1",
      port: process.env.DEPLOY_NETWORK_PORT,
      network_id: "*",
    },
    // prod:test environment
    polygon: {
      provider: () => {
        return new HDWalletProvider(
          testAccounts,
          `https://${process.env.DEPLOY_POLYGON_NETWORK}.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
          0,
          numBuiltIn
        );
      },
      network_id: '*', // eslint-disable-line camelcase
      confirmations: 2,
      skipDryRun: true
    },
    ethereum: {
      provider: () => {
        return new HDWalletProvider(
          testAccounts,
          `https://${process.env.DEPLOY_ETHEREUM_NETWORK}.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
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
      version: "^0.8.0",  // ex:  "0.4.20". (Default: Truffle's installed solc)
      docker: false,
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: "constantinople"
      }
    }
  },
  db: {
    enabled: true
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
