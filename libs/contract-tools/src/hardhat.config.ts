import type { HardhatUserConfig } from "hardhat/config";
import "@typechain/hardhat";
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import '@openzeppelin/hardhat-upgrades';
import { getNetworks } from './hardhat.network';

// Did we specify a network?
const networkIdx = process.argv.findIndex(arg => arg === "--network");
const defaultNetwork = networkIdx === -1 ? process.env.HARDHAT_NETWORK : process.argv[networkIdx + 1];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.2",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    artifacts: "./src/contracts",
    root: process.cwd(),
    cache: `${process.cwd()}/.hardhat/cache`,
  },
  typechain: {
    outDir: "src/types"
  },
  defaultNetwork,
  networks: getNetworks(),
  etherscan: {
    apiKey: defaultNetwork == "polygon"
      ? process.env.POLYGONSCAN_API_KEY
      : process.env.ETHERSCAN_API_KEY
  },
}

export default config;
