import { initializeDevLive } from "./3.1_init_devlive";
import { initializeProdTest } from "./3.1_init_prodtest";

const deploy: MigrationStep = (artifacts) =>
  async (_deployer, network, accounts) => {
    // On development blockchain, seed accounts with random data
    const contract = artifacts.require("TheCoin");
    if (network === 'development') {
      await initializeDevLive(contract, accounts)
    }
    else if (network.startsWith('prodtest')) {
      await initializeProdTest(contract, accounts);
    }
  }

module.exports = deploy;
