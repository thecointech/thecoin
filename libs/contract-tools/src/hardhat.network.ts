import { getProvider, Network } from '@thecointech/ethers-provider';

// Our providers are source-of-truth for connections to the blockchain
function getLiveNetwork(type: Network) {
  const provider = getProvider(type);
  return {
    chainId: provider.network.chainId,
    url: provider.connection.url,
  }
}
function getDevNetwork() {
  return {
    url: "http://localhost:9545",
    chainId: 31337
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
