import type { HardhatUserConfig } from "hardhat/config";
import "@typechain/hardhat";
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import '@openzeppelin/hardhat-upgrades';

// Did we specify a network?
const networkIdx = process.argv.findIndex(arg => arg === "--network");
const network = networkIdx === -1 ? undefined : process.argv[networkIdx + 1];

const networks = process.env.CONFIG_NAME?.startsWith("prod")
  ? {
    polygon: {
      chainId: parseInt(process.env.DEPLOY_POLYGON_NETWORK_ID ?? "-1"),
    },
    ethereum: {
      chainId: parseInt(process.env.DEPLOY_ETHEREUM_NETWORK_ID ?? "-1"),
    }
  }
  : {
    localhost: {
      url: "http://localhost:9545",
      chainId: 31337
    },
  }


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
  networks,
  etherscan: {
    apiKey: network == "polygon"
      ? process.env.POLYGONSCAN_API_KEY
      : process.env.ETHERSCAN_API_KEY
  },
}

export default config;
