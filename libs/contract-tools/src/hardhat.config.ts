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
    hardhat: {
      //@ts-ignore
      port: 9545
    }
  }
}

export default config;
