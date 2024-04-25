import type { HardhatUserConfig } from "hardhat/config";
import "@typechain/hardhat";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";
import '@openzeppelin/hardhat-upgrades';
import { getNetworks } from './hardhat.network';

// Did we specify a network?
const networkIdx = process.argv.findIndex(arg => arg === "--network");
const defaultNetwork = networkIdx === -1 ? process.env.HARDHAT_NETWORK : process.argv[networkIdx + 1];

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
  paths: {
    artifacts: "./src/codegen",
    root: process.cwd(),
    cache: `${process.cwd()}/.hardhat/cache`,
  },
  typechain: {
    outDir: "src/codegen"
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
