import { toNamedAccounts } from "./accounts";
import { initializeDevLive } from "./4.1_mad_devlive";
import { initializeTestNet } from "./4.1_mad_testnet";
import { MigrationStep } from './step';
import { getContract } from './deploy';

const deploy: MigrationStep = () =>
  async (deployer, network, accounts) => {
    const contract = await getContract(deployer, network);
    const namedAccounts = toNamedAccounts(accounts);
    // On development blockchain, seed accounts with random data
    const config = process.env.CONFIG_NAME;
    if (false && network == "polygon") {
      if (config === 'devlive') {
        await initializeDevLive(contract, namedAccounts)
      }
      else if (config === "prodtest") {
        await initializeTestNet(contract, namedAccounts);
      }
    }
  }

module.exports = deploy;
