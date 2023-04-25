import type { Network } from '@thecointech/ethers-provider';

function getLiveNetwork(_type: Network) {
  // Our providers are source-of-truth for connections to the blockchain
  // TODO: Revert to using providers if/when HardHat allows ESM modules for config files.
  // NOTE: These URLs won't work, they should be Infura urls similar to https://hardhat.org/hardhat-runner/docs/config
  const url = process.env.CONFIG_NAME === "prodtest"
   ? 'https://polygon-mumbai.infura.io/v3/'
   : "https://polygon-mainnet.infura.io/v3/"

  return {
    chainId: parseInt(process.env.DEPLOY_POLYGON_NETWORK_ID!),
    url: `${url}${process.env.INFURA_PROJECT_ID}`,
  }
}
function getDevNetwork() {
  return {
    url: "http://localhost:9545",
    chainId: parseInt(process.env.DEPLOY_POLYGON_NETWORK_ID!),
    // Just too much spam in the dev:live logs
    loggingEnabled: false,
  }
}
export function getNetworks() {
  return process.env.CONFIG_NAME?.startsWith("prod")
    ? {
        polygon: getLiveNetwork("POLYGON"),
        ethereum: getLiveNetwork("ETHEREUM"),
      }
    : {
        polygon: getDevNetwork(),
        localhost: getDevNetwork(),
      }
}
