import { initializeDevLive } from "./3.1_init_devlive";
import { initializeTestNet } from "./3.1_init_testnet";

const deploy: MigrationStep = () =>
  async (_, network) => {
    // On development blockchain, seed accounts with random data
    if (network === 'development') {
      await initializeDevLive()
    }
    else if (network.startsWith('prodtest')) {
      await initializeTestNet();
    }
  }

module.exports = deploy;
