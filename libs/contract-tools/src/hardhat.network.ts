// import type { Network } from '@thecointech/ethers-provider';
import { getSecret } from '@thecointech/secrets';
import { NetworkUserConfig } from "hardhat/types/config"

async function getLiveNetwork(_type: any): Promise<NetworkUserConfig> {
  // Our providers are source-of-truth for connections to the blockchain
  // TODO: Revert to using providers if/when HardHat allows ESM modules for config files.
  // NOTE: These URLs won't work, they should be Infura urls similar to https://hardhat.org/hardhat-runner/docs/config
  const url = process.env.CONFIG_NAME === "prodtest"
   ? 'https://polygon-amoy.infura.io/v3/'
   : "https://polygon-mainnet.infura.io/v3/"

  const projectId = await getSecret("InfuraProjectId");
  if (!projectId) {
    throw new Error("Missing Infura project ID");
  }
  return {
    type: "http",
    chainId: parseInt(process.env.DEPLOY_POLYGON_NETWORK_ID!),
    url: `${url}${projectId}`,
  }
}
function getDevNetwork(): NetworkUserConfig {
  return {
    // url: "http://localhost:9545",
    type: "edr-simulated",
    chainId: parseInt(process.env.DEPLOY_POLYGON_NETWORK_ID!),
    // Just too much spam in the dev:live logs
    loggingEnabled: false,
  }
}
export async function getNetworks(): Promise<Record<string, NetworkUserConfig>> {
  return process.env.CONFIG_NAME?.startsWith("prod")
    ? {
        polygon: await getLiveNetwork("POLYGON"),
        ethereum: await getLiveNetwork("ETHEREUM"),
      }
    : {
        polygon: getDevNetwork(),
        localhost: getDevNetwork(),
        // hardhat: {
        //   loggingEnabled: false,
        // }
      }
}
