import type { HardhatUserConfig } from "hardhat/config";
import "@typechain/hardhat";
import '@nomiclabs/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';

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
    artifacts: "./src/contracts",
    root: process.cwd(),
    cache: `${process.cwd()}/.hardhat/cache`,
  },
  typechain: {
    outDir: "src/types"
  },
  networks: {
    localhost: {
      url: "http://localhost:9545",
      chainId: 31337
    },
  }
}

export default config;
