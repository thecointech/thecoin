import { toNamedAccounts } from "./accounts";
import { initializeDevLive } from "./4.1_mad_devlive";
import { initializeTestNet } from "./4.1_mad_testnet";
import { MigrationStep } from './step';

const deploy: MigrationStep = (artifacts) =>
  async (_, network, accounts) => {
    const contract = artifacts.require("TheCoin");
    const proxy = await contract.deployed();
    const namedAccounts = toNamedAccounts(accounts);
    // On development blockchain, seed accounts with random data
    if (network === 'devlive') {
      await initializeDevLive(proxy, namedAccounts)
    }
    else if (network.startsWith('prodtest')) {
      await initializeTestNet(proxy, namedAccounts);
    }
  }

module.exports = deploy;
