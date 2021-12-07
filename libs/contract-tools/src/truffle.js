'use strict';
// Load environment for the network we are deploying to
require('../../../tools/setenv');
require('../../../__mocks__/mock_node');

var path = require('path');
const { getSigner } = require('@thecointech/signers');
const { TruffleEthersProvider } = require("@thecointech/truffle-ethers-provider");
const { deployProvider } = require("@thecointech/ethers-provider");

// Allow using typescript in deployments
loadTypescript();

// Dev networks run on local net
function getDevNetworks() {
  return {
    networks: {
      polygon: {
        host: "127.0.0.1",
        port: process.env.DEPLOY_NETWORK_PORT,
        network_id: "*",
      },
      ethereum: {
        host: "127.0.0.1",
        port: process.env.DEPLOY_NETWORK_PORT,
        network_id: "*",
      }
    }
  }
}

function getLiveNetworks() {

  return {
    // remote environments (both test & mainnet)
    networks: {
      polygon: {
        provider: () => new TruffleEthersProvider(
          { [process.env.WALLET_Owner_ADDRESS]: () => getSigner("Owner") },
          deployProvider("POLYGON"),
        ),
        network_id: process.env.DEPLOY_POLYGON_NETWORK_ID, // eslint-disable-line camelcase
        confirmations: 2,
        skipDryRun: true,
        // Set an insanely long timeout to allow entering
        // in the pin on a hw wallet
        networkCheckTimeout: 10 * 60 * 1000,
      },
      ethereum: {
        provider: () => new TruffleEthersProvider(
          { [process.env.WALLET_Owner_ADDRESS]: () => getSigner("Owner") },
          deployProvider("ETHEREUM"),
        ),
        network_id: process.env.DEPLOY_ETHEREUM_NETWORK_ID, // eslint-disable-line camelcase
        skipDryRun: true
      },
    },
    plugins: [
      'truffle-plugin-verify'
    ],
    api_keys: {
      etherscan: process.env.ETHERSCAN_API_KEY,
      polygonscan: process.env.POLYGONSCAN_API_KEY
    }
  }
}

function loadTypescript() {
  require("ts-node").register({
    dir: process.cwd(),
    files: true,
    compilerOptions: {
      typeRoots: ["./migrations/types"]
    }
  });
}

const cwd = process.cwd();
const configs = process.env.CONFIG_NAME === "devlive"
  ? getDevNetworks()
  : getLiveNetworks()

module.exports = {

  // We output into our src directory so we can directly import
  // the JSON artifacts into our TS code.
  contracts_build_directory: path.join(cwd, "src", "contracts"),

  /**
  * contracts_directory tells Truffle where the contracts you want to compile are located
  */
  contracts_directory: path.join(cwd, 'contracts'),

  // Generate networks depending on configurations
  ...configs,

  compilers: {
    solc: {
      version: "^0.8.0",
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
}

