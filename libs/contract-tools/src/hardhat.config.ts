import type { HardhatUserConfig } from "hardhat/config";
import { getNetworks } from "./hardhat.network.js";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: await getNetworks(),
};

export default config;
